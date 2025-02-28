export default function Spinner({ style }) {
  return (
    <div className={`${style} spinner-container min-h-[700px]`}>
      <div className="spinner"></div>
    </div>
  )
}