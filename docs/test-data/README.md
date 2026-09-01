# Test data

This test set contains scanned documents used to check upload, page processing,
transcription, and verification across different layouts, languages, writing
styles, and scan conditions. The files are available in the following shared
Google Drive folders:

- [Source scans](https://drive.google.com/drive/folders/1z2FY8gqJEj_XgmBms1LetI9v2ZT1FOaS?usp=sharing)
- [Ground-truth transcriptions](https://drive.google.com/drive/folders/16ID2GJpJSIjpdRlmnnMbqyNmYHgSEWqA?usp=sharing)
- [Synthetic scans with JSON ground truth](https://drive.google.com/drive/folders/1dSgo_ey_cJV2LdjdndZcDEfUAfCtyALr?usp=sharing) — each scan has a corresponding JSON transcription.

## Document categories

| Category                                                                                                        | Content                                                                                           |
| --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| [Letters](https://drive.google.com/drive/folders/10lDsC4VqvdJEZHewtYEQdPFvkiOVm3OL)                             | Personal and school correspondence in English, French, and German.                                |
| [Lecture notes](https://drive.google.com/drive/folders/1zfsKyv65PUTh4-HQkiJ43Qn68LD9FWqE)                       | Student notebooks, law-school notes, and Louis Pasteur's French lecture notes.                    |
| [Lab journals](https://drive.google.com/drive/folders/1Zj2blkyLFPOVzNxOkimxDV1mVL4DT0zD)                        | Scientific notes, laboratory records, drawings, and graphs.                                       |
| [Diaries](https://drive.google.com/drive/folders/1QVMluCrqHCUZSRDp2lZAyUTc32ynd8cl)                             | Personal diaries and journals in English and German.                                              |
| [School registers](https://drive.google.com/drive/folders/1gZkTnwbApbqBW_vbD_qzoUbiK2i3-aIx)                    | Friends registers and school registers, including an eighth-grade register from 1908–1909.        |
| [Parish and metric books](https://drive.google.com/drive/folders/1pnyk5YoIsFbvz9fmQSnAOl9NNkTnz16w?usp=sharing) | Parish registers and metric books recording births, marriages, and deaths.                        |
| [Meeting minutes](https://drive.google.com/drive/folders/15y9UISuxfNrrqromQubEeJy_k_g0pVEM)                     | Meeting minutes and institutional records.                                                        |
| [Ledgers](https://drive.google.com/drive/folders/1D6I8EvtSfzFSNw8YK8R1qCOTzy8eDL16)                             | Historical accounting and record-keeping ledgers.                                                 |
| [Contracts and agreements](https://drive.google.com/drive/folders/1anJdjeKAyXOawKRNhABrTYXhiwXUkUac)            | Contracts, indentures, and agreements, including documents concerning harvest rights.             |
| [Medical records](https://drive.google.com/drive/folders/1Mj2Ge4Hpz5pL--N5Z7AWcjM4pxfeg028)                     | Admission registers, clinical case records, and physicians' prescriptions with transcriptions.    |
| [Manuscripts](https://drive.google.com/drive/folders/1e0whCXNYmWRkRPu5SQoQK9n81ZrCwN6-)                         | Greek, Arabic, Chinese, and German manuscripts on astronomical, mathematical, and other subjects. |

## Edge cases

The [edge-cases folder](https://drive.google.com/drive/folders/16n5ozE06gDul3yl6hIJaJ39SVD36qNp1)
contains deliberately difficult or invalid inputs used during upload and
processing checks:

- **Oversized ZIP archive** — a roughly 900 MB archive used for upload-limit
  checks.
- **Noisy or damaged scan** — a poor-quality document used for processing and
  transcription checks.
- **Low contrast** — faint handwritten notes used to check text recognition
  when foreground and background tones are close.
- **No text** — a botanical document with illustrations and no useful text to
  transcribe.
- **Single-page image** — a French lecture note used for the standalone-image
  upload and processing flow.
- **Mixed languages and scripts** — a Spanish–Latin–Nahuatl dictionary used for
  multilingual and structured-content checks.

## How the data is used

The datasets are used to:

- upload PDF, ZIP, and standalone image files;
- process one-page and multi-page documents;
- work with different handwriting styles, languages, layouts, and scan quality;
- check pages containing handwriting, printed text, tables, drawings, graphs,
  or no text;
- compare AI transcription with ground truth when a matching reference file is
  available;
- prepare repeatable positive, negative, boundary, and exploratory checks.

Ground-truth files should use names that match their source scans. Manual
ground truth is prepared without viewing the AI output. JSON ground truth must
identify the field that contains the reference plain text used for comparison.
