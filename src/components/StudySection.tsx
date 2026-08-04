import type { StudySection as StudySectionType } from "@/data/chemistry";
import { ElectrolysisWorkbench } from "@/components/ElectrolysisWorkbench";
import { ColoredChemText } from "@/components/ColoredChemText";
import { BatteryReactionWorksheet } from "@/components/BatteryReactionWorksheet";
import { ReactionMapStudio } from "@/components/ReactionMapStudio";
import { GasStudyLab } from "@/components/GasStudyLab";
import { ElectrochemistryLab } from "@/components/ElectrochemistryLab";
import { ElectrochemistrySimulator } from "@/components/ElectrochemistrySimulator";
import { ElectrochemistryQuizGenerator } from "@/components/ElectrochemistryQuizGenerator";
import { OrganicKnowledgeBrowser } from "@/components/OrganicKnowledgeBrowser";

export function StudySection({ section }: { section: StudySectionType }) {
  return (
    <section className="study-section" id={section.id}>
      <div className="study-section-heading">
        <h2>{section.title}</h2>
        {section.description && <p>{section.description}</p>}
      </div>

      {section.kind === "cards" && (
        <div className="knowledge-grid">
          {section.entries.map((entry) => (
            <article className="knowledge-card" key={entry.title}>
              <h3><ColoredChemText>{entry.title}</ColoredChemText></h3>
              <p><ColoredChemText>{entry.body}</ColoredChemText></p>
              {entry.equation && <div className="equation-box"><ColoredChemText>{entry.equation}</ColoredChemText></div>}
              {entry.note && <small>{entry.note}</small>}
            </article>
          ))}
        </div>
      )}

      {section.kind === "table" && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>{section.columns.map((column) => <th key={column}>{column}</th>)}</tr>
            </thead>
            <tbody>
              {section.rows.map((row, rowIndex) => (
                <tr key={`${section.id}-${rowIndex}`}>
                  {row.map((cell, cellIndex) => <td key={`${section.id}-${rowIndex}-${cellIndex}`}><ColoredChemText>{cell}</ColoredChemText></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {section.kind === "flow" && (
        <div className="flow-list">
          {section.flows.map((flow) => (
            <article className="flow-card" key={flow.title}>
              <h3>{flow.title}</h3>
              <div className="flow-nodes">
                {flow.nodes.map((node, index) => (
                  <div className="flow-fragment" key={`${flow.title}-${node}`}>
                    <span className="flow-node"><ColoredChemText>{node}</ColoredChemText></span>
                    {index < flow.nodes.length - 1 && <span className="flow-arrow">→</span>}
                  </div>
                ))}
              </div>
              {flow.note && <p>{flow.note}</p>}
            </article>
          ))}
        </div>
      )}

      {section.kind === "electrolysis" && <ElectrolysisWorkbench cases={section.cases} />}
      {section.kind === "batteryWorksheet" && <BatteryReactionWorksheet />}
      {section.kind === "reactionMaps" && <ReactionMapStudio category={section.category} />}
      {section.kind === "organicKnowledge" && <OrganicKnowledgeBrowser />}
      {section.kind === "gasLab" && <GasStudyLab />}
      {section.kind === "electrochemistryLab" && <ElectrochemistryLab />}
      {section.kind === "electrochemistrySimulator" && <ElectrochemistrySimulator />}
      {section.kind === "electrochemistryQuizGenerator" && <ElectrochemistryQuizGenerator />}
    </section>
  );
}
