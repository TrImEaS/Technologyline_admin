export default function Nav({ user }) {
  return(
    <section className="flex items-center justify-between px-10 w-full h-[70px] border-2 border-blue-400 z-10 bg-white border-dashed">
      <span className="font-semibold">
        Indicadores
      </span>
      <span>
        Bienvenido <span className="text-blue-400 font-semibold">{user.slice(0,1).toUpperCase() + user.slice(1)}</span>
      </span>
    </section>
  )
}