export default function Spinner({ style }) {
  return (
    <div className={`${style} spinner-container min-h-[250px]`}>
      <div className="spinner"></div>
    </div>
  )
}