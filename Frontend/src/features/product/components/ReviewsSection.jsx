import React from "react";

const ReviewsSection = ({
  reviews,
  averageRating,
  reviewForm,
  setReviewForm,
  ratingHover,
  setRatingHover,
  onSubmitReview,
}) => {
  return (
    <section id="reviews-section" className="border-t border-neutral-100 pt-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Reviews Summary Stats */}
        <div className="lg:col-span-4 bg-white border border-neutral-100 rounded-3xl p-6 shadow-sm">
          <span className="text-[9px] tracking-[0.3em] font-bold text-brand-accent uppercase mb-2 block">
            Client Feedback
          </span>
          <h3 className="font-serif text-xl md:text-2xl text-brand-dark font-light mb-4">
            Creations Rating
          </h3>
          <div className="flex items-baseline gap-2.5 mb-6">
            <span className="text-5xl font-serif font-bold text-brand-dark">{averageRating}</span>
            <span className="text-gray-400 text-xs font-sans">/ 5.0</span>
          </div>

          {/* Stars breakout summary */}
          <div className="flex flex-col gap-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = reviews.filter((r) => r.rating === stars).length;
              const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={stars} className="flex items-center text-xs text-gray-400">
                  <span className="w-3">{stars}</span>
                  <svg className="w-3.5 h-3.5 fill-current text-amber-400 mx-1" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <div className="flex-grow h-1.5 bg-neutral-100 rounded-full mx-2.5 overflow-hidden">
                    <div
                      className="h-full bg-brand-accent rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-4 text-right text-[10px] font-mono">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviews List & Write Form */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          {/* Reviews List */}
          <div className="flex flex-col gap-6">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-dark border-b border-neutral-50 pb-3">
              Client Feedbacks ({reviews.length})
            </h4>
            {reviews.length === 0 ? (
              <p className="text-gray-400 text-xs italic">
                No reviews submitted yet for this atelier item.
              </p>
            ) : (
              <div className="flex flex-col gap-6 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                {reviews.map((r, idx) => (
                  <div key={idx} className="border-b border-neutral-50 pb-5 last:border-b-0">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-brand-accent/15 border border-brand-accent/20 flex items-center justify-center text-brand-accent text-[9px] font-serif font-bold">
                          {r.name
                            ? r.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                            : ""}
                        </span>
                        <div>
                          <h5 className="text-xs font-semibold text-brand-dark">{r.name}</h5>
                          <span className="text-[8px] text-gray-400 font-sans">{r.date}</span>
                        </div>
                      </div>
                      {r.verified && (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-emerald-100">
                          ✓ Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-amber-500 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-3.5 h-3.5 fill-current ${
                            i < r.rating ? "text-amber-500" : "text-gray-200"
                          }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-gray-500 text-xs font-sans leading-relaxed whitespace-pre-line">
                      {r.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Write a Review form */}
          <div className="bg-neutral-50/50 border border-neutral-100 rounded-3xl p-6">
            <span className="text-[9px] tracking-[0.3em] font-bold text-brand-accent uppercase mb-1 block">
              Share Your Drape Experience
            </span>
            <h4 className="font-serif text-lg text-brand-dark font-light mb-4">Write a review</h4>

            <form onSubmit={onSubmitReview} className="flex flex-col gap-4">
              {/* Star selector */}
              <div>
                <label className="text-gray-400 text-[9px] uppercase tracking-wider block mb-1">
                  Your Rating
                </label>
                <div className="flex items-center gap-1 text-gray-200">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      onMouseEnter={() => setRatingHover(star)}
                      onMouseLeave={() => setRatingHover(0)}
                      className="p-0.5 text-xl transition-transform hover:scale-110 cursor-pointer"
                    >
                      <svg
                        className={`w-6 h-6 fill-current ${
                          star <= (ratingHover || reviewForm.rating)
                            ? "text-amber-500"
                            : "text-gray-200"
                        }`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name input */}
              <div>
                <label
                  htmlFor="reviewerName"
                  className="text-gray-400 text-[9px] uppercase tracking-wider block mb-1"
                >
                  Your Name
                </label>
                <input
                  type="text"
                  id="reviewerName"
                  required
                  placeholder="e.g. Priyasen D."
                  value={reviewForm.name}
                  onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                  className="w-full bg-white border border-neutral-200 focus:border-brand-accent text-xs rounded-xl h-11 px-4 outline-none transition-all placeholder-gray-400 text-brand-dark focus:ring-1 focus:ring-brand-accent/20"
                />
              </div>

              {/* Comment textarea */}
              <div>
                <label
                  htmlFor="reviewerComment"
                  className="text-gray-400 text-[9px] uppercase tracking-wider block mb-1"
                >
                  Review Details
                </label>
                <textarea
                  id="reviewerComment"
                  required
                  rows={3}
                  placeholder="How is the weave composition, drape flow, or sizing fit..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="w-full bg-white border border-neutral-200 focus:border-brand-accent p-4 rounded-xl outline-none text-xs text-brand-dark leading-relaxed resize-none transition-all placeholder-gray-400 focus:ring-1 focus:ring-brand-accent/20"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="inline-flex items-center justify-center bg-brand-dark hover:bg-neutral-800 text-white font-medium h-11 rounded-xl transition-all duration-300 tracking-wider uppercase text-[10px] cursor-pointer"
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
