import { supabase } from './client';

export interface CustomCitationFormat {
  id: number;
  user_id: string;
  name: string;
  
  font_family: string;
  font_size: number;
  font_color: string;
  
  text_alignment: string;
  line_spacing: number;
  
  paragraph_before: number;
  paragraph_after: number;
  
  first_line_indent: number;
  left_indent: number;
  right_indent: number;
  
  margin_top: number;
  margin_bottom: number;
  margin_left: number;
  margin_right: number;
  
  paper_size: string;
  orientation: string;
  
  header_distance: number;
  footer_distance: number;
  
  page_number_enabled: boolean;
  page_number_position: string;
  
  heading1_size: number;
  heading1_bold: boolean;
  heading1_italic: boolean;
  heading1_alignment: string;
  
  heading2_size: number;
  heading2_bold: boolean;
  heading2_italic: boolean;
  heading2_alignment: string;
  
  heading3_size: number;
  heading3_bold: boolean;
  heading3_italic: boolean;
  heading3_alignment: string;
  
  hanging_indent: number;
  reference_spacing: number;
  
  settings?: any; // JSONB column for future configurations
  
  created_at?: string;
  updated_at?: string;
}

export type CustomCitationFormatInsert = Omit<CustomCitationFormat, 'id' | 'created_at' | 'updated_at'>;
export type CustomCitationFormatUpdate = Partial<CustomCitationFormatInsert>;

export const customFormatsService = {
  async fetchFormats(userId: string): Promise<CustomCitationFormat[]> {
    const { data, error } = await supabase
      .from('custom_citation_formats')
      .select('*')
      .eq('user_id', userId)
      .order('name');
      
    if (error) throw error;
    return data || [];
  },
  
  async createFormat(format: CustomCitationFormatInsert): Promise<CustomCitationFormat> {
    const { data, error } = await supabase
      .from('custom_citation_formats')
      .insert(format)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  async updateFormat(id: number, format: CustomCitationFormatUpdate): Promise<CustomCitationFormat> {
    const { data, error } = await supabase
      .from('custom_citation_formats')
      .update(format)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  async deleteFormat(id: number): Promise<void> {
    const { error } = await supabase
      .from('custom_citation_formats')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  }
};
