import type { StudySection as StudySectionType } from "@/data/chemistry";

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
              <h3>{entry.title}</h3>
              <p>{entry.body}</p>
              {entry.equation && <div className="equation-box">{entry.equation}</div>}
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
                  {row.map((cell, cellIndex) => <td key={`${section.id}-${rowIndex}-${cellIndex}`}>{cell}</td>)}
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
                    <span className="flow-node">{node}</span>
                    {index < flow.nodes.length - 1 && <span className="flow-arrow">→</span>}
                  </div>
                ))}
              </div>
              {flow.note && <p>{flow.note}</p>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
