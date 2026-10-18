import { StudyLink } from "@/components/StudyLink";
import { illustratedLessons } from "@/data/illustrated/types";

export function IllustratedLessonLinks() {
  return <section className="illustrated-entry no-print" aria-label="図で理解する有機化学">
    <p className="eyebrow">VISUAL CHEMISTRY</p><h2>図で理解する有機化学</h2>
    <div className="illustrated-entry-grid">{illustratedLessons.map(lesson=><StudyLink key={lesson.slug} href={`/illustrated/${lesson.slug}`}>
      <span aria-hidden="true">{lesson.slug==="polymers" ? "⌁" : "⬡"}</span><strong>{lesson.title} →</strong><p>{lesson.description}</p><small>構造図・比較表・穴埋め・A4印刷</small>
    </StudyLink>)}</div>
  </section>;
}
