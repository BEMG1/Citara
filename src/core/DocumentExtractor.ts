
import type { ICoverPageData } from '@/interfaces/ICoverPage';
import type { IReference } from './referenceUtils';
import type { IFigure } from '@/interfaces/IFigure';

export interface IExtractionResult {
  coverPage: ICoverPageData | null;
  references: IReference[];
  figures: IFigure[];
  bodyHtml: string;
}

export class DocumentExtractor {
  static extract(html: string): IExtractionResult {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const nodes = Array.from(doc.body.childNodes);
    
    let coverPage: ICoverPageData | null = null;
    let references: IReference[] = [];
    let figures: IFigure[] = [];
    
    let bodyStartIndex = 0;
    let bodyEndIndex = nodes.length;

    // 1. Cover Page Detection Heuristic
    const firstNodes = nodes.slice(0, 15).filter(n => n.textContent?.trim());
    
    let titleIndex = -1;
    let repeatedTitleIndex = -1;
    let firstLongParagraphIndex = -1;
    
    // Find if the first node's text is repeated exactly
    for (let i = 0; i < firstNodes.length; i++) {
      const text = firstNodes[i].textContent?.trim();
      if (!text) continue;
      
      if (text.length > 150 && firstLongParagraphIndex === -1) {
        firstLongParagraphIndex = i;
      }

      if (titleIndex === -1 && text.length > 0 && text.length < 150) {
        titleIndex = i;
      } else if (titleIndex !== -1 && text.toLowerCase() === firstNodes[titleIndex].textContent?.trim().toLowerCase()) {
        repeatedTitleIndex = i;
      }
    }
    
    let cpNodes: ChildNode[] = [];
    let foundCoverPage = false;

    if (repeatedTitleIndex !== -1 && titleIndex !== -1) {
      cpNodes = firstNodes.slice(titleIndex, repeatedTitleIndex);
      bodyStartIndex = nodes.indexOf(firstNodes[repeatedTitleIndex]);
      foundCoverPage = true;
    } else if (firstLongParagraphIndex > 1 && titleIndex !== -1 && firstLongParagraphIndex <= 10) {
      cpNodes = firstNodes.slice(titleIndex, firstLongParagraphIndex);
      bodyStartIndex = nodes.indexOf(firstNodes[firstLongParagraphIndex]);
      foundCoverPage = true;
    } else {
      // Fallback: Check for typical cover page keywords in the first few nodes
      const coverPageKeywords = /universidad|fundaci[oó]n|instituci[oó]n|facultad|escuela|nrc|curso|docente|profesor|tutor|área andina|college|university/i;
      let lastKeywordIndex = -1;
      for (let i = 0; i < firstNodes.length; i++) {
        if (coverPageKeywords.test(firstNodes[i].textContent || '')) {
          lastKeywordIndex = i;
        }
      }
      
      if (lastKeywordIndex !== -1 && titleIndex !== -1) {
        const endIndex = Math.min(Math.max(lastKeywordIndex + 2, 5), firstNodes.length);
        let allShort = true;
        for (let i = 0; i < endIndex; i++) {
          if ((firstNodes[i].textContent?.trim().length || 0) > 150) {
            allShort = false;
            break;
          }
        }
        if (allShort) {
          cpNodes = firstNodes.slice(titleIndex, endIndex);
          // Only slice if there's actually a body afterwards
          if (endIndex < nodes.length) {
            bodyStartIndex = nodes.indexOf(firstNodes[endIndex]) !== -1 
              ? nodes.indexOf(firstNodes[endIndex]) 
              : nodes.indexOf(firstNodes[endIndex - 1]) + 1;
          } else {
            bodyStartIndex = nodes.length;
          }
          foundCoverPage = true;
        }
      }
    }

    if (foundCoverPage && cpNodes.length > 0) {
      coverPage = {
        enabled: true,
        title: cpNodes[0]?.textContent?.trim() || '',
        authors: cpNodes[1]?.textContent?.trim() || '',
        institution: cpNodes[2]?.textContent?.trim() || '',
        faculty: cpNodes[3]?.textContent?.trim() || '',
        course: cpNodes[4]?.textContent?.trim() || '',
        teacher: cpNodes[5]?.textContent?.trim() || '',
        date: cpNodes[6]?.textContent?.trim() || '',
        city: '',
      };
    }

    // 2. References Detection Heuristic
    for (let i = nodes.length - 1; i >= bodyStartIndex; i--) {
      const node = nodes[i] as HTMLElement;
      if (!node.textContent) continue;
      
      const text = node.textContent.trim().toLowerCase();
      // Match exact headers that usually denote references
      if (/^(referencias|references|bibliograf[ií]a|bibliography)$/.test(text) && (node.nodeName.match(/^H[1-6]$/) || node.nodeName === 'P' || node.nodeName === 'STRONG' || node.nodeName === 'B')) {
        bodyEndIndex = i; 
        
        for (let j = i + 1; j < nodes.length; j++) {
          const refNode = nodes[j];
          const refText = refNode.textContent?.trim();
          if (refText && refText.length > 10) {
            references.push({
              id: crypto.randomUUID(),
              type: 'article', // fallback type
              title: refText,
              author: '',
              year: '',
            });
          }
        }
        break;
      }
    }

    // 3. Figures Detection Heuristic
    const bodyNodes = nodes.slice(bodyStartIndex, bodyEndIndex);
    const bodyContainer = doc.createElement('div');
    bodyNodes.forEach(node => bodyContainer.appendChild(node.cloneNode(true)));
    
    const imgElements = Array.from(bodyContainer.querySelectorAll('img'));
    imgElements.forEach((img, index) => {
      // Intenta encontrar texto cercano que diga "Figura X"
      let figureNumber = index + 1;
      let figureTitle = `Figura Importada ${figureNumber}`;
      let caption = '';
      
      const parentBlock = img.closest('p, div');
      if (parentBlock) {
        // Buscar el hermano anterior o texto anterior
        const prevSibling = parentBlock.previousElementSibling;
        if (prevSibling && prevSibling.textContent?.toLowerCase().includes('figura')) {
          figureTitle = prevSibling.textContent.trim();
          // Removemos el nodo anterior porque ya lo convertimos en titulo de la figura
          prevSibling.remove();
        }
        
        // Buscar el hermano siguiente para la leyenda o nota
        const nextSibling = parentBlock.nextElementSibling;
        if (nextSibling && nextSibling.textContent?.toLowerCase().includes('nota')) {
          caption = nextSibling.textContent.trim();
          nextSibling.remove();
        }
      }

      const newFigure: IFigure = {
        id: crypto.randomUUID(),
        number: figureNumber,
        imageUrl: img.src,
        title: figureTitle,
        note: caption,
      };
      
      figures.push(newFigure);

      // Reemplazamos el img por nuestro FigureNode de TipTap
      const figureHtml = doc.createElement('figure');
      figureHtml.setAttribute('data-type', 'figure');
      figureHtml.setAttribute('id', newFigure.id);
      figureHtml.setAttribute('number', newFigure.number.toString());
      figureHtml.setAttribute('imageUrl', newFigure.imageUrl);
      figureHtml.setAttribute('title', newFigure.title);
      if (newFigure.note) figureHtml.setAttribute('note', newFigure.note);

      if (parentBlock) {
        parentBlock.replaceWith(figureHtml);
      } else {
        img.replaceWith(figureHtml);
      }
    });

    return {
      coverPage,
      references,
      figures,
      bodyHtml: bodyContainer.innerHTML
    };
  }
}
