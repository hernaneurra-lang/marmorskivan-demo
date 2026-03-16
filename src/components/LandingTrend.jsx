// Path: src/components/LandingTrend.jsx
import { heroTiles } from "@/config/site";
import { useTranslation } from "react-i18next";

export default function LandingTrend() {
  const { t } = useTranslation();

  return (
    <section>
      <div className="trendHeader">
        <h2>{t("landing.trend.title")}</h2>
        <span className="trendBadge">{t("landing.trend.badge")}</span>
      </div>

      <div className="trendGrid">
        {heroTiles.map((tile) => {
          const title = t(`landing.trend.tiles.${tile.id}.title`, {
            defaultValue: tile.id,
          });

          const subtitle = t(`landing.trend.tiles.${tile.id}.subtitle`, {
            defaultValue: "",
          });

          return (
            <article key={tile.id} className="trendTile">
              <img src={tile.src} alt={title} />
              <h3>{title}</h3>
              {subtitle && <p>{subtitle}</p>}
            </article>
          );
        })}
      </div>
    </section>
  );
}
