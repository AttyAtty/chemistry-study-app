import { StudyLink } from "@/components/StudyLink";
import { illustratedLessons } from "@/data/illustrated/types";
import { inorganicLessons } from "@/data/illustrated/inorganicTypes";

export function IllustratedLessonLinks({inorganic=false}:{inorganic?:boolean}) {
  const title=`図で理解する${inorganic?"無機":"有機"}化学`;
  return <section className="illustrated-entry no-print" aria-label={title}>
    <p className="eyebrow">VISUAL CHEMISTRY</p><h2>{title}</h2>
    <div className="illustrated-entry-grid">{(inorganic?inorganicLessons:illustratedLessons).map(lesson=><StudyLink key={lesson.slug} href={`/illustrated/${lesson.slug}`}>
      <span aria-hidden="true">{lesson.slug==="polymers" ? "⌁" : "⬡"}</span><strong>{lesson.title} →</strong><p>{lesson.description}</p><small>構造図・比較表・穴埋め・A4印刷</small>
    </StudyLink>)}</div>
  </section>;
}
