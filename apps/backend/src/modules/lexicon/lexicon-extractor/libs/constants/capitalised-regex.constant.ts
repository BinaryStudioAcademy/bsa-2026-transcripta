const CAPITALISED_REGEX =
	/(?<![\p{L}\p{M}])\p{Lu}[\p{L}\p{M}]*(?:['’-][\p{L}\p{M}]+)*(?![\p{L}\p{M}])/gu;

export { CAPITALISED_REGEX };
