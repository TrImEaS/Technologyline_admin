import { useEffect, useState } from "react"
import Swal from 'sweetalert2'

const API_URL = import.meta.env.MODE === 'production' ? import.meta.env.VITE_API_URL_PROD : import.meta.env.VITE_API_URL_DEV;


export default function Login({ loginSetter, userSetter }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    // Verificar si hay una hora de inicio de sesión guardada
    const loginTime = localStorage.getItem('loginTime');
    
    if (loginTime) {
      const currentTime = Date.now();
      const hoursSinceLogin = (currentTime - loginTime) / (1000 * 60 * 60);

      if (hoursSinceLogin >= 12) {
        // Si han pasado más de 12 horas, se obliga a iniciar sesión nuevamente
        localStorage.removeItem('loginTime');
        Swal.fire({
          icon: 'warning',
          title: 'Sesión expirada. Por favor, inicie sesión nuevamente.',
          timer: 3000,
          timerProgressBar: true
        });
      }
      else {
        loginSetter(true)
      }
    }
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!username || !password) {
      Swal.fire({
        icon: 'warning',
        title: 'Se requiere llenar todos los campos',
        timer: 3000,
        timerProgressBar: true
      });
      return;
    }

    fetch(`${API_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    })
    .then(response => {
      if (response.status === 202) {
        Swal.fire({
          icon: 'success',
          title: 'Logeado con éxito',
          timer: 2000,
          timerProgressBar: true,
          didClose: () => {
            // Guardar la hora de conexión en localStorage
            localStorage.setItem('loginTime', Date.now());

            userSetter(username);
            loginSetter(true);
          }
        });
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Usuario o contraseña incorrectos, intente nuevamente',
          timer: 3000,
          timerProgressBar: true
        });
      }
    })
    .catch(e => console.error('Error al loguearse: ', e));
  }

  return (
    <section className="flex flex-col gap-8 justify-center items-center min-h-screen w-screen bg-[#191625]">
      <h1 className="font-bold text-white font-serif text-2xl xl:text-4xl">
        Technology Line - Admin
      </h1>
      <form
        className="flex flex-col border-4 p-5 min-w-[250px] w-4/5 max-w-[450px] h-[350px] rounded-lg gap-8" 
        onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <label
            className="text-white font-bold" 
            htmlFor="username-login">Ingrese usuario</label>
          <input
            id="username-login"
            type="text"
            value={username}
            className="w-full rounded-lg py-1 px-2 outline-none"
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Ingrese nombre de usuario"
          />
        </div>

        <div className="flex flex-col gap-2">
        <label
          className="text-white font-bold" 
          htmlFor="password-login">Ingrese contraseña</label>
          <input
            id="password-login"
            type="password"
            value={password}
            className="w-full rounded-lg py-1 px-2 outline-none"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Ingrese su contraseña"
          />
        </div>

        <div className="flex items-center justify-center w-full">
          <button 
            className="font-bold py-2 px-3 border-4 rounded-lg hover:text-black hover:bg-white duration-300 text-white"
            type="submit">
            Iniciar sesión
          </button>
        </div>
      </form>
    </section>
  )
}