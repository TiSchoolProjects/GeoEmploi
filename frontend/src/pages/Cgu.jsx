import { useEffect, useRef, useState } from "react";
import "../CSS/More.css";
import NavBar from "../components/Navbar";
import { useTranslation } from "react-i18next";

function ContentBlock({ node }) {
  return (
    <div className="content-block">
      {node.soustitre && <h4 className="content-under-title">{node.soustitre}</h4>}
      {node.corps && node.corps.map((p, i) => <p className="content-paragraphe" key={i}>{p}</p>)}
      {node.liste && (
        <dl className="content-list">
          {node.liste.map(([term, def], i) => (
            <div className="content-list-item" key={i}>
              <dt>{term}</dt>
              <dd>{def}</dd>
            </div>
          ))}
        </dl>
      )}
      {node.table && (
        <div className="content-table">
          {node.table.map(([label, val], i) => (
            <div className="content-table-row" key={i}>
              <div className="content-table-label">{label}</div>
              <div className="content-table-value">{val}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function More() {
  const { t } = useTranslation();
  const cguArticles = t("more.cgu.articles", { returnObjects: true }) || [];
  const transArticles = t("more.transparency.articles", { returnObjects: true }) || [];

  const [activeTab, setActiveTab] = useState("cgu");
  const [activeArticle, setActiveArticle] = useState(cguArticles[0]?.id || "art1");
  const articleRefs = useRef({});

  useEffect(() => {
    if (activeTab !== "cgu") return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveArticle(entry.target.id);
      });
    });
    Object.values(articleRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [activeTab]);

  const scrollToArticle = (id) => {
    articleRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <NavBar />
      <main className="more-page">
        <header className="more-header">
          <h1>{t("more.title")}</h1>
          <p>{t("more.subtitle")}</p>
        </header>

        <nav className="more-tabs">
          <button
            type="button"
            className={activeTab === "cgu" ? "active" : ""}
            onClick={() => setActiveTab("cgu")}
          >
            {t("more.tabs.cgu")}
          </button>
          <button
            type="button"
            className={activeTab === "transparence" ? "active" : ""}
            onClick={() => setActiveTab("transparence")}
          >
            {t("more.tabs.transparency")}
          </button>
        </nav>

        {activeTab === "cgu" && (
          <section className="more-section">
            <h2>{t("more.cgu.title")}</h2>
            <div className="content-layout">
              <nav className="content-summary">
                <p className="content-summary-titre">{t("more.summary")}</p>
                {cguArticles.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className={"content-summary-item" + (activeArticle === a.id ? " active" : "")}
                    onClick={() => scrollToArticle(a.id)}
                  >
                    Art. {a.num} — {a.titre}
                  </button>
                ))}
              </nav>

              <div className="content-content">
                {cguArticles.map((a) => (
                  <section
                    key={a.id}
                    id={a.id}
                    ref={(el) => (articleRefs.current[a.id] = el)}
                    className="content-article"
                  >
                    <div className="content-article-header">
                      <span className="content-article-num">{t("more.articleLabel")} {a.num}</span>
                      <h3>{a.titre}</h3>
                    </div>
                    {a.corps && <ContentBlock node={{ corps: a.corps }} />}
                    {a.liste && <ContentBlock node={{ liste: a.liste }} />}
                    {a.sousArticles && a.sousArticles.map((s, i) => <ContentBlock key={i} node={s} />)}
                  </section>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === "transparence" && (
          <section className="more-section">
            <h2>{t("more.transparency.title")}</h2>
            <div className="under-title">
              <p>{t("more.transparency.intro")}</p>
            </div>
            <div className="content-layout">
              <nav className="content-summary">
                <p className="content-summary-titre">{t("more.summary")}</p>
                {transArticles.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className={"content-summary-item" + (activeArticle === a.id ? " active" : "")}
                    onClick={() => scrollToArticle(a.id)}
                  >
                    Art. {a.num} — {a.titre}
                  </button>
                ))}
              </nav>

              <div className="content-contenu">
                {transArticles.map((a) => (
                  <section
                    key={a.id}
                    id={a.id}
                    ref={(el) => (articleRefs.current[a.id] = el)}
                    className="content-article"
                  >
                    <div className="content-article-header">
                      <span className="content-article-num">{t("more.articleLabel")} {a.num}</span>
                      <h3>{a.titre}</h3>
                    </div>
                    {a.corps && <ContentBlock node={{ corps: a.corps }} />}
                    {a.liste && <ContentBlock node={{ liste: a.liste }} />}
                    {a.sousArticles && a.sousArticles.map((s, i) => <ContentBlock key={i} node={s} />)}
                  </section>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}