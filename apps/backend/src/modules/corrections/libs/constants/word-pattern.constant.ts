// A word can carry the marks a transcription uses for an unsure reading, such
// as "Kaamenko(?)" or "Kova[?]enko", so those travel with it rather than
// splitting it into pieces.
const WORD_PATTERN =
	/[\p{L}\p{N}](?:[\p{L}\p{N}()[\]?'’-]*[\p{L}\p{N})\]?])?/gu;

export { WORD_PATTERN };
