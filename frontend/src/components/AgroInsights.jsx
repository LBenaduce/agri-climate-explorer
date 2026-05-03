import React from "react";

function AgroInsights({ insights, t }) {
  if (!insights.length) {
    return <p>{t.agroEmpty}</p>;
  }

  return (
    <div>
      <h3>{t.agroTitle}</h3>
      {insights.map((item, i) => (
        <div key={i}>
          <strong>{item.title}</strong>
          <p>{item.message}</p>
          <p><strong>{t.recommendation}:</strong> {item.recommendation}</p>
        </div>
      ))}
    </div>
  );
}

export default AgroInsights;
