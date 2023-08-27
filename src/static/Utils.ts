export class Utils {
	public static splitArray<T>(array: T[], span: number): T[][] {
		return new Array(Math.ceil(array.length / span))
			.fill(null)
			.map((_, i) => array.slice(i * span, (i + 1) * span));
	}
}
