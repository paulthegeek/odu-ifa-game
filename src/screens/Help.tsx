import { OPELE_MAPPING } from '../data/config';
import { ScreenTitle } from '../components/ScreenTitle';
import { Sign } from '../components/Sign';
import { OduName } from '../components/OduName';
import { getOdu, signText } from '../logic/odu';

export function Help({ onBack, backLabel }: { onBack: () => void; backLabel: string }) {
  const example = getOdu('osa_irete');
  const openMark = OPELE_MAPPING.open === 1 ? 'single mark (I)' : 'double mark (II)';
  const closedMark = OPELE_MAPPING.closed === 1 ? 'single mark (I)' : 'double mark (II)';
  return (
    <div className="page">
      <header className="page-head">
        <ScreenTitle>How to read a sign</ScreenTitle>
        <p className="muted">Reading order, single and double marks, and a worked example.</p>
      </header>

      <section className="card">
        <h2>Reading order</h2>
        <ul>
          <li>A sign has two legs, each with four marks, read from top to bottom.</li>
          <li>
            Signs are drawn from the diviner’s point of view. The <strong>right leg</strong> is on your right
            and is read first. The <strong>left leg</strong> is read second.
          </li>
          <li>
            The name is the right leg followed by the left leg. For example, right <span lang="yo">Ọ̀sá</span>{' '}
            and left <span lang="yo">Ìrẹtẹ̀</span> is <OduName id="osa_irete" />.
          </li>
          <li>
            When both legs are the same, the name changes: Ogbè on both legs is <OduName id="ogbe_ogbe" />,
            and any other principal Odù on both legs is “Méjì”, e.g. <OduName id="otura_otura" />.
          </li>
        </ul>
      </section>

      <section className="card">
        <h2>Single and double marks</h2>
        <ul>
          <li>
            On the <span lang="yo">ọpọ́n Ifá</span>, a single mark is one stroke (I) and a double mark is two
            parallel strokes (II).
          </li>
          <li>
            On the <span lang="yo">opẹ̀lẹ̀</span>, an <strong>open</strong> seed (hollow inner side up, pale
            center) is a {openMark}. A <strong>closed</strong> seed (outer shell up, with a ridge) is a{' '}
            {closedMark}.
          </li>
          <li>Turn on “Show marks” in round settings to see I / II beside each seed while you learn.</li>
        </ul>
      </section>

      <section className="card">
        <h2>
          Example: <OduName id={example.id} />
        </h2>
        <div className="help-figures">
          <figure>
            <Sign mode="opele" cells={example.marks} size="medium" showMarks />
            <figcaption className="hint">
              <span lang="yo">Opẹ̀lẹ̀</span>
            </figcaption>
          </figure>
          <figure>
            <Sign mode="opon" cells={example.marks} size="medium" />
            <figcaption className="hint">
              <span lang="yo">Ọpọ́n Ifá</span>
            </figcaption>
          </figure>
        </div>
        <p className="sign-text">Right leg | Left leg: {signText(example.marks)}</p>
      </section>

      <button type="button" className="btn btn-primary page-back" onClick={onBack}>
        {backLabel}
      </button>
    </div>
  );
}
