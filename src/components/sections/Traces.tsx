import { useInView } from "@/hooks/useInView";
import "./traces.css";

type Trace = {
  name: string;
  category: string;
  paragraphs: string[];
};

const traces: Trace[] = [
  {
    name: "Наталья #1214059",
    category: "Практикум",
    paragraphs: [
      "Для меня это был не просто практикум — а процесс вытаскивания себя из внутренней ловушки. Через практики я наконец встретила свои замороженные чувства. Злость, обиду, отчаяние.",
      "Я поняла: чтобы по-настоящему двигаться, нужно не прятаться от боли, а пройти сквозь неё.",
    ],
  },
  {
    name: "Ульяна #1178974",
    category: "Работа с отношениями",
    paragraphs: [
      "Когда мы решили обратиться к семейному психологу, я была настроена скептически. Но Ксения Константиновна помогла нам разобраться в наших переживаниях, научила слышать друг друга и говорить о чувствах без обвинений.",
      "Сейчас наши отношения стали ближе и счастливее.",
    ],
  },
  {
    name: "xxMariyaXx",
    category: "Индивидуальная терапия",
    paragraphs: [
      "После травматичного разрыва отношений у меня появились состояния тревоги, упадок сил и энергии.",
      "Я выбрала Ксению, потому что сразу обратила внимание на медицинское образование. В процессе терапии я справилась не только со своими переживаниями, но и обнаружила новые направления для развития.",
    ],
  },
  {
    name: "Карина Смирнова",
    category: "Изменение сценария",
    paragraphs: [
      "Работа с психологом была переломным моментом. Я научилась замечать свои страхи и ожидания, которые мешали отношениям.",
      "Теперь я чувствую себя увереннее в отношениях и благодарна Ксении за этот результат.",
    ],
  },
  {
    name: "Мишка #84808",
    category: "Диагностика",
    paragraphs: [
      "С первого дня общения с Ксенией я заметила изменения в лучшую сторону. Ксения Константиновна задавала точные вопросы, внимательно выслушала и объяснила, почему ситуация происходит именно так.",
    ],
  },
];

function TraceItem({ trace }: { trace: Trace }) {
  const { ref, inView } = useInView<HTMLLIElement>({
    threshold: 0,
    rootMargin: "0px 0px -6% 0px",
  });

  return (
    <li ref={ref} className={`traces-item ${inView ? "is-in" : ""}`.trim()}>
      <p className="traces-name">{trace.name}</p>
      <p className="traces-category">{trace.category}</p>
      <blockquote className="traces-quote">
        {trace.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </blockquote>
    </li>
  );
}

export default function Traces() {
  return (
    <section className="section traces" id="traces" aria-labelledby="traces-title">
      <div className="traces-wrap">
        <div className="traces-copy">
          <h2 className="traces-title" id="traces-title">
            Следы изменений
          </h2>
          <p className="traces-lead">
            Истории людей, которые смогли увидеть свой сценарий и начать выбирать иначе.
          </p>
        </div>

        <ol className="traces-list">
          {traces.map((trace) => (
            <TraceItem key={trace.name} trace={trace} />
          ))}
        </ol>
      </div>
    </section>
  );
}
