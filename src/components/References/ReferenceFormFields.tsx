import React from 'react';
import { useLanguage } from '@/context/AppContext';
import { Field } from '@/components/ui/Field';
import { type IReference, getYearError } from '@/utils/referenceUtils';

interface ReferenceFormFieldsProps {
  reference: IReference;
  onChange: (field: keyof IReference, value: string) => void;
}

export const ReferenceFormFields: React.FC<ReferenceFormFieldsProps> = ({ reference, onChange }) => {
  const { t } = useLanguage();

  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-2)', fontFamily: 'var(--ui-font)' }}>
          {t('sourceType')}
        </label>
        <select
          value={reference.type}
          onChange={(e) => onChange('type', e.target.value)}
          className="block w-full pl-3 pr-10 py-2 text-sm rounded-md outline-none transition-colors"
          style={{ border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', fontFamily: 'var(--ui-font)' }}
        >
          <option value="book">{t('typeBook')}</option>
          <option value="article">{t('typeArticle')}</option>
          <option value="website">{t('typeWebsite')}</option>
          <option value="video">{t('typeVideo')}</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label={t('authors')}
          hint={t('authorsHint')}
          value={reference.author}
          onChange={(v) => onChange('author', v)}
          placeholder={t('authorsPlaceholder')}
          colSpan
        />
        <Field
          label={t('year')}
          value={reference.year}
          onChange={(v) => onChange('year', v)}
          placeholder={t('yearPlaceholder')}
          error={getYearError(reference.year)}
        />
        <Field
          label={t('title')}
          value={reference.title}
          onChange={(v) => onChange('title', v)}
          placeholder={t('titlePlaceholder')}
          colSpan
        />

        {reference.type === 'book' && (
          <Field
            label={t('publisher')}
            value={reference.publisher || ''}
            onChange={(v) => onChange('publisher', v)}
            placeholder={t('publisherPlaceholder')}
            colSpan
          />
        )}

        {reference.type === 'article' && (
          <>
            <Field
              label={t('journalName')}
              value={reference.journal || ''}
              onChange={(v) => onChange('journal', v)}
              placeholder={t('journalPlaceholder')}
              colSpan
            />
            <Field
              label={t('volume')}
              value={reference.volume || ''}
              onChange={(v) => onChange('volume', v)}
              placeholder="12"
            />
            <Field
              label={t('issue')}
              value={reference.issue || ''}
              onChange={(v) => onChange('issue', v)}
              placeholder="4"
            />
            <Field
              label={t('pages')}
              value={reference.pages || ''}
              onChange={(v) => onChange('pages', v)}
              placeholder="123-145"
              colSpan
            />
            <Field
              label={t('doi')}
              hint={t('doiHint')}
              value={reference.doi || ''}
              onChange={(v) => onChange('doi', v)}
              placeholder="10.1016/j.ejemplo.2024.01.001"
              colSpan
            />
          </>
        )}

        {reference.type === 'website' && (
          <>
            <Field
              label={t('siteName')}
              value={reference.siteName || ''}
              onChange={(v) => onChange('siteName', v)}
              placeholder={t('siteNamePlaceholder')}
              colSpan
            />
            <Field
              label={t('url')}
              value={reference.url || ''}
              onChange={(v) => onChange('url', v)}
              placeholder="https://www.ejemplo.com"
              colSpan
            />
          </>
        )}

        {reference.type === 'video' && (
          <>
            <Field
              label={t('channelName')}
              value={reference.channel || ''}
              onChange={(v) => onChange('channel', v)}
              placeholder={t('channelPlaceholder')}
              colSpan
            />
            <Field
              label={t('url')}
              value={reference.url || ''}
              onChange={(v) => onChange('url', v)}
              placeholder="https://www.youtube.com/watch?v=..."
              colSpan
            />
          </>
        )}
      </div>
    </>
  );
};
