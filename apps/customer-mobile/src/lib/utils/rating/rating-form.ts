// فورم تقييم الزيارة (فريم 31) — منقول من RateVisitCubit في Flutter
export const RATING_TAGS = ["lightHand", "cleanPlace", "respectful", "fairPrice", "accurateQueue"] as const;
export type RatingTag = (typeof RATING_TAGS)[number];
export const MAX_RATING_PHOTOS = 3;
export const MAX_RATING_COMMENT = 500;

export interface RatingForm {
  /** ١..٥، صفر = لسه */
  overall: number;
  quality: number;
  cleanliness: number;
  timeAccuracy: number;
  tags: RatingTag[];
  comment: string;
  anonymous: boolean;
  /** uris من image picker */
  photos: string[];
}

export const EMPTY_RATING: RatingForm = { overall: 0, quality: 0, cleanliness: 0, timeAccuracy: 0, tags: [], comment: "", anonymous: false, photos: [] };

/** أول تقييم عام بيملا التفاصيل اللي لسه ما اتلمستش، فالتقييم السريع يفضل ضغطة واحدة */
export const setOverall = (f: RatingForm, stars: number): RatingForm => ({
  ...f,
  overall: stars,
  quality: f.quality || stars,
  cleanliness: f.cleanliness || stars,
  timeAccuracy: f.timeAccuracy || stars,
});
