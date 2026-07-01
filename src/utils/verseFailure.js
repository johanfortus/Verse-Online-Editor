export class VerseFailure extends Error {
	constructor(message) {
		super(message);
		this.name = 'VerseFailure';
	}
}
