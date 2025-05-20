import "./loading.scss";

export default function Loading() {
  return (
    <div className="loading-container">
      <div className="spinner" />
      <span>Carregando...</span>
    </div>
  );
}