import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { Check, Download, Loader2, PencilLine } from 'lucide-react';
import {
  AlignmentType,
  Document as WordDocument,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from 'docx';
import { jsPDF } from 'jspdf';
import { API_BASE_URL } from '../config/api';

type PaperResponse = {
  title: string;
  file_name: string;
  markdown: string;
  sections: {
    abstract: string;
    introduction: string;
    literature_review: string;
    methodology: string;
    results: string;
    discussion: string;
    conclusion: string;
    future_work: string;
    acknowledgements: string;
    references: string[];
  };
  metadata: {
    authors: string[];
    affiliations: string[];
    keywords: string[];
  };
};

type DownloadFormat = 'pdf' | 'docx';

const previewSectionLabels: Array<{ key: keyof PaperResponse['sections']; label: string }> = [
  { key: 'abstract', label: 'Abstract' },
  { key: 'introduction', label: 'Introduction' },
  { key: 'literature_review', label: 'Literature Review' },
  { key: 'methodology', label: 'Methodology' },
  { key: 'results', label: 'Results' },
  { key: 'discussion', label: 'Discussion' },
  { key: 'conclusion', label: 'Conclusion' },
  { key: 'future_work', label: 'Future Work' },
  { key: 'acknowledgements', label: 'Acknowledgements' },
];

const formDefaults = {
  title: '',
  authors: '',
  affiliations: '',
  keywords: '',
  abstract: '',
  intro: '',
  literatureReview: '',
  methodology: '',
  results: '',
  discussion: '',
  conclusion: '',
  futureWork: '',
  acknowledgements: '',
  references: '',
};

const formatOptions: Array<{ value: DownloadFormat; label: string; description: string }> = [
  { value: 'pdf', label: 'PDF', description: 'Fixed layout for sharing and submission' },
  { value: 'docx', label: 'Word', description: 'Editable output for Word or Google Docs' },
];

const builderNotes = [
  'Add only the sections you need. Empty sections stay out of the final file.',
  'If the backend builder is unavailable, the page still creates the file locally.',
  'References can be added one per line or separated with semicolons.',
];

const cleanText = (value: string) => value.replace(/\r/g, '').trim();

const cleanCommaList = (value: string) =>
  value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

const cleanLineList = (value: string) =>
  value
    .split(/\r?\n|;/)
    .map((item) => item.trim())
    .filter(Boolean);

const slugifyFileName = (value: string) => {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || 'research-paper';
};

const buildSection = (title: string, body: string) => {
  const cleaned = cleanText(body);
  if (!cleaned) {
    return null;
  }

  return `## ${title}\n\n${cleaned}`;
};

const buildLocalPaper = (form: typeof formDefaults): PaperResponse => {
  const title = cleanText(form.title) || 'Untitled Research Paper';
  const authors = cleanCommaList(form.authors);
  const affiliations = cleanLineList(form.affiliations);
  const keywords = cleanCommaList(form.keywords);
  const references = cleanLineList(form.references);

  const sections = {
    abstract: cleanText(form.abstract),
    introduction: cleanText(form.intro),
    literature_review: cleanText(form.literatureReview),
    methodology: cleanText(form.methodology),
    results: cleanText(form.results),
    discussion: cleanText(form.discussion),
    conclusion: cleanText(form.conclusion),
    future_work: cleanText(form.futureWork),
    acknowledgements: cleanText(form.acknowledgements),
    references,
  };

  const markdownSections = [
    buildSection('Abstract', form.abstract),
    buildSection('Introduction', form.intro),
    buildSection('Literature Review', form.literatureReview),
    buildSection('Methodology', form.methodology),
    buildSection('Results', form.results),
    buildSection('Discussion', form.discussion),
    buildSection('Conclusion', form.conclusion),
    buildSection('Future Work', form.futureWork),
    buildSection('Acknowledgements', form.acknowledgements),
    references.length
      ? `## References\n\n${references.map((reference, index) => `${index + 1}. ${reference}`).join('\n')}`
      : null,
  ].filter(Boolean);

  const headerLines = [`# ${title}`];

  if (authors.length) {
    headerLines.push(`**Authors:** ${authors.join(', ')}`);
  }

  if (affiliations.length) {
    headerLines.push(`**Affiliations:** ${affiliations.join('; ')}`);
  }

  if (keywords.length) {
    headerLines.push(`**Keywords:** ${keywords.join(', ')}`);
  }

  return {
    title,
    file_name: `${slugifyFileName(title)}.md`,
    markdown: [headerLines.join('\n'), ...markdownSections].join('\n\n'),
    sections,
    metadata: {
      authors,
      affiliations,
      keywords,
    },
  };
};

const buildFileName = (fileName: string, format: DownloadFormat) => {
  const baseName = fileName.replace(/\.(md|docx|pdf)$/i, '');
  return `${baseName}.${format}`;
};

const buildWordParagraphs = (payload: PaperResponse) => {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      text: payload.title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
    }),
  ];

  if (payload.metadata.authors.length) {
    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({ text: 'Authors: ', bold: true }),
          new TextRun(payload.metadata.authors.join(', ')),
        ],
      }),
    );
  }

  if (payload.metadata.affiliations.length) {
    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({ text: 'Affiliations: ', bold: true }),
          new TextRun(payload.metadata.affiliations.join('; ')),
        ],
      }),
    );
  }

  if (payload.metadata.keywords.length) {
    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [
          new TextRun({ text: 'Keywords: ', bold: true }),
          new TextRun(payload.metadata.keywords.join(', ')),
        ],
      }),
    );
  }

  const addSection = (title: string, body: string) => {
    if (!body) {
      return;
    }

    paragraphs.push(
      new Paragraph({
        text: title,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 120 },
      }),
    );

    paragraphs.push(
      new Paragraph({
        children: [new TextRun(body)],
        spacing: { after: 180 },
      }),
    );
  };

  addSection('Abstract', payload.sections.abstract);
  addSection('Introduction', payload.sections.introduction);
  addSection('Literature Review', payload.sections.literature_review);
  addSection('Methodology', payload.sections.methodology);
  addSection('Results', payload.sections.results);
  addSection('Discussion', payload.sections.discussion);
  addSection('Conclusion', payload.sections.conclusion);
  addSection('Future Work', payload.sections.future_work);
  addSection('Acknowledgements', payload.sections.acknowledgements);

  if (payload.sections.references.length) {
    paragraphs.push(
      new Paragraph({
        text: 'References',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 120 },
      }),
    );

    payload.sections.references.forEach((reference, index) => {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun(`${index + 1}. ${reference}`)],
          spacing: { after: 80 },
        }),
      );
    });
  }

  return paragraphs;
};

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
};

const downloadAsDocx = async (payload: PaperResponse) => {
  const document = new WordDocument({
    sections: [
      {
        properties: {},
        children: buildWordParagraphs(payload),
      },
    ],
  });

  const blob = await Packer.toBlob(document);
  downloadBlob(blob, buildFileName(payload.file_name, 'docx'));
};

const downloadAsPdf = (payload: PaperResponse) => {
  const pdf = new jsPDF({
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const left = 56;
  const right = 56;
  const maxWidth = pageWidth - left - right;
  let y = 64;

  const ensureSpace = (needed = 24) => {
    if (y + needed > pageHeight - 56) {
      pdf.addPage();
      y = 64;
    }
  };

  const addWrappedText = (text: string, fontSize = 11, lineHeight = 18) => {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    lines.forEach((line: string) => {
      ensureSpace(lineHeight);
      pdf.text(line, left, y);
      y += lineHeight;
    });
  };

  pdf.setFont('times', 'bold');
  pdf.setFontSize(20);
  const titleLines = pdf.splitTextToSize(payload.title, maxWidth);
  titleLines.forEach((line: string) => {
    ensureSpace(26);
    pdf.text(line, pageWidth / 2, y, { align: 'center' });
    y += 26;
  });

  y += 10;
  pdf.setFont('times', 'normal');
  pdf.setFontSize(11);

  if (payload.metadata.authors.length) {
    addWrappedText(`Authors: ${payload.metadata.authors.join(', ')}`);
    y += 4;
  }

  if (payload.metadata.affiliations.length) {
    addWrappedText(`Affiliations: ${payload.metadata.affiliations.join('; ')}`);
    y += 4;
  }

  if (payload.metadata.keywords.length) {
    addWrappedText(`Keywords: ${payload.metadata.keywords.join(', ')}`);
    y += 10;
  }

  const addSection = (title: string, body: string) => {
    if (!body) {
      return;
    }

    ensureSpace(28);
    pdf.setFont('times', 'bold');
    pdf.setFontSize(14);
    pdf.text(title, left, y);
    y += 22;

    pdf.setFont('times', 'normal');
    pdf.setFontSize(11);
    addWrappedText(body);
    y += 8;
  };

  addSection('Abstract', payload.sections.abstract);
  addSection('Introduction', payload.sections.introduction);
  addSection('Literature Review', payload.sections.literature_review);
  addSection('Methodology', payload.sections.methodology);
  addSection('Results', payload.sections.results);
  addSection('Discussion', payload.sections.discussion);
  addSection('Conclusion', payload.sections.conclusion);
  addSection('Future Work', payload.sections.future_work);
  addSection('Acknowledgements', payload.sections.acknowledgements);

  if (payload.sections.references.length) {
    ensureSpace(28);
    pdf.setFont('times', 'bold');
    pdf.setFontSize(14);
    pdf.text('References', left, y);
    y += 22;
    pdf.setFont('times', 'normal');
    pdf.setFontSize(11);

    payload.sections.references.forEach((reference, index) => {
      addWrappedText(`${index + 1}. ${reference}`);
      y += 4;
    });
  }

  pdf.save(buildFileName(payload.file_name, 'pdf'));
};

const CreatePaperPage = () => {
  const [form, setForm] = useState(formDefaults);
  const [result, setResult] = useState<PaperResponse | null>(null);
  const [error, setError] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<DownloadFormat>('pdf');
  const [downloaded, setDownloaded] = useState(false);

  const fieldGroups = useMemo(
    () => [
      {
        title: 'Paper identity',
        fields: [
          { key: 'title', label: 'Paper title', placeholder: 'Explainable AI for Clinical Triage Systems', type: 'input', span: 'full' },
          { key: 'authors', label: 'Authors', placeholder: 'One per line or comma separated', type: 'textarea', span: 'half' },
          { key: 'affiliations', label: 'Affiliations', placeholder: 'Department of Computer Science, ABC University', type: 'textarea', span: 'half' },
          { key: 'keywords', label: 'Keywords', placeholder: 'explainability, triage, healthcare AI', type: 'textarea', span: 'full' },
        ],
      },
      {
        title: 'Core sections',
        fields: [
          { key: 'abstract', label: 'Abstract', placeholder: 'Summarize the paper in one compact paragraph.', type: 'textarea', span: 'full' },
          { key: 'intro', label: 'Introduction', placeholder: 'Introduce the problem, motivation, and scope of the paper.', type: 'textarea', span: 'half' },
          { key: 'literatureReview', label: 'Literature review', placeholder: 'Describe related work and how your paper differs.', type: 'textarea', span: 'half' },
          { key: 'methodology', label: 'Methodology', placeholder: 'Explain the method, dataset, process, or framework used.', type: 'textarea', span: 'half' },
          { key: 'results', label: 'Results', placeholder: 'Present the key findings, observations, or outputs.', type: 'textarea', span: 'half' },
          { key: 'discussion', label: 'Discussion', placeholder: 'Interpret the results, limitations, and implications.', type: 'textarea', span: 'half' },
          { key: 'conclusion', label: 'Conclusion', placeholder: 'Close the paper with the main takeaway.', type: 'textarea', span: 'half' },
          { key: 'futureWork', label: 'Future work', placeholder: 'Add any next steps or research extensions.', type: 'textarea', span: 'half' },
          { key: 'acknowledgements', label: 'Acknowledgements', placeholder: 'Optional acknowledgements section.', type: 'textarea', span: 'half' },
          { key: 'references', label: 'References', placeholder: 'One reference per line.', type: 'textarea', span: 'full' },
        ],
      },
    ],
    [],
  );

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const downloadFile = async (payload: PaperResponse, format: DownloadFormat) => {
    if (format === 'docx') {
      await downloadAsDocx(payload);
      return;
    }

    downloadAsPdf(payload);
  };

  const buildPaper = async () => {
    if (!form.title.trim()) {
      setError('Add a paper title before building the file.');
      return;
    }

    if (!form.abstract.trim() && !form.intro.trim()) {
      setError('Add at least an abstract or introduction so the paper has real content.');
      return;
    }

    setIsBuilding(true);
    setError('');
    setDownloaded(false);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/create-paper`, form);
      setResult(response.data);
      await downloadFile(response.data, selectedFormat);
      setDownloaded(true);
      window.setTimeout(() => setDownloaded(false), 2200);
    } catch (requestError: any) {
      console.error('Paper assembly failed', requestError);
      const fallbackPaper = buildLocalPaper(form);
      setResult(fallbackPaper);
      await downloadFile(fallbackPaper, selectedFormat);
      setDownloaded(true);
      window.setTimeout(() => setDownloaded(false), 2200);
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <div className="page-shell animate-rise">
      <section className="page-hero">
        <p className="page-kicker">Paper builder</p>
        <h1 className="page-title max-w-[13ch]">Assemble your sections into a cleaner paper export.</h1>
        <p className="page-copy">
          Fill in the parts you already know, choose a format, and generate a downloadable research-paper file without leaving the app.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="panel-card p-6 md:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-[var(--brand-soft)] text-[var(--accent-strong)]">
              <PencilLine size={20} />
            </div>
            <div>
              <p className="panel-title">Research paper assembler</p>
              <p className="panel-copy mt-1">Build the file section by section, then download it right away.</p>
            </div>
          </div>

          <div className="mt-6">
            <p className="panel-title">Download format</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {formatOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedFormat(option.value)}
                  className={`rounded-[20px] border px-4 py-4 text-left transition-all duration-200 ${
                    selectedFormat === option.value
                      ? 'border-[var(--accent)] bg-[var(--brand-soft)] shadow-[0_12px_28px_var(--accent-glow)]'
                      : 'border-[var(--border)] bg-[var(--surface-subtle)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <p className="text-sm font-semibold text-main">{option.label}</p>
                  <p className="mt-1 text-xs leading-6 text-soft">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-6">
            {fieldGroups.map((group) => (
              <div key={group.title} className="subtle-panel rounded-[24px] p-5">
                <p className="panel-title">{group.title}</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {group.fields.map((field) => (
                    <div key={field.key} className={field.span === 'full' ? 'md:col-span-2' : ''}>
                      <label className="text-sm font-medium text-main">{field.label}</label>
                      {field.type === 'input' ? (
                        <input
                          value={form[field.key as keyof typeof form]}
                          onChange={(event) => updateField(field.key as keyof typeof form, event.target.value)}
                          placeholder={field.placeholder}
                          className="input-surface mt-2"
                        />
                      ) : (
                        <textarea
                          value={form[field.key as keyof typeof form]}
                          onChange={(event) => updateField(field.key as keyof typeof form, event.target.value)}
                          placeholder={field.placeholder}
                          className={`input-surface mt-2 resize-none ${
                            field.span === 'full' ? 'min-h-[126px]' : 'min-h-[100px]'
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {error ? (
            <div className="mt-5 rounded-[20px] border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => void buildPaper()}
            disabled={isBuilding}
            className="primary-button mt-6 w-full rounded-[18px] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isBuilding ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
            Build and download {selectedFormat === 'pdf' ? 'PDF' : 'Word'}
          </button>
        </div>

        <div className="panel-stack">
          <div className="panel-card p-5">
            <div className="panel-header">
              <p className="panel-title">Builder notes</p>
              <p className="panel-copy">A few details worth keeping in mind before exporting.</p>
            </div>
            <div className="mt-5 space-y-3">
              {builderNotes.map((note) => (
                <div key={note} className="surface-note">
                  {note}
                </div>
              ))}
            </div>
          </div>

          <div className="panel-card min-h-[640px] p-6">
            {result ? (
              <div className="flex h-full flex-col">
                <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="page-kicker">Paper preview</p>
                      <h2 className="mt-2 text-2xl font-semibold text-[var(--text-strong)] md:text-3xl">{result.title}</h2>
                      {result.metadata.authors.length ? (
                        <p className="mt-3 text-sm text-soft">{result.metadata.authors.join(', ')}</p>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={() => void downloadFile(result, selectedFormat)}
                      className="secondary-button rounded-[18px]"
                    >
                      {downloaded ? <Check size={16} /> : <Download size={16} />}
                      {downloaded ? 'Downloaded' : `Download ${selectedFormat === 'pdf' ? 'PDF' : 'Word'} again`}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {result.metadata.keywords.map((keyword) => (
                      <span key={keyword} className="stat-chip">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex flex-1 flex-col gap-4 overflow-y-auto pr-1">
                  {result.metadata.affiliations.length ? (
                    <div className="subtle-panel rounded-[22px] p-5">
                      <p className="page-kicker">Affiliations</p>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-main">{result.metadata.affiliations.join('\n')}</p>
                    </div>
                  ) : null}

                  {previewSectionLabels.map(({ key, label }) =>
                    result.sections[key] ? (
                      <div key={key} className="subtle-panel rounded-[22px] p-5">
                        <p className="page-kicker">{label}</p>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-main md:text-[15px]">
                          {Array.isArray(result.sections[key])
                            ? (result.sections[key] as string[]).join('\n')
                            : result.sections[key]}
                        </p>
                      </div>
                    ) : null,
                  )}
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="max-w-xl text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-[var(--brand-soft)] text-[var(--accent-strong)]">
                    <PencilLine size={24} />
                  </div>
                  <h2 className="mt-5 text-2xl font-semibold text-[var(--text-strong)]">Your assembled paper will appear here.</h2>
                  <p className="mt-3 text-sm leading-7 text-soft md:text-[15px]">
                    Add your sections on the left, build the file, and this preview area will show the exported structure before or after download.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CreatePaperPage;
