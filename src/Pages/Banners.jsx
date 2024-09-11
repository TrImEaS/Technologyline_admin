import { useEffect, useState } from "react";
import Swal from 'sweetalert2';
import 'sweetalert2/src/sweetalert2.scss';

export default function Banners() {
  const [desktopBanners, setDesktopBanners] = useState([]);
  const [mobileBanners, setMobileBanners] = useState([]);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = () => {
    fetch('https://technologyline.com.ar/api/page/getBanners')
      .then(res => {
        if (!res.ok) {
          throw new Error('Error fetching banners');
        }
        return res.json();
      })
      .then(data => {
        // Filtrar banners según el nombre para móvil y escritorio
        setMobileBanners(data.filter(banner => banner.name.toLowerCase().includes('mobile')));
        setDesktopBanners(data.filter(banner => banner.name.toLowerCase().includes('desktop')));
      })
      .catch(error => console.error(error));
  };

  const handleBannerAction = (id, name) => {
    Swal.fire({
      title: 'Subir banner',
      html: `
        <div class="flex flex-col gap-2 items-center justify-center">
          <input type="file" id="upload-file" class="swal2-input w-full" accept="image/*">
          <input type="text" id="to" class="swal2-input placeholder:text-sm placeholder:text-gray-400 w-full" placeholder="Ej: https://technologyline.com.ar/search/?category=tecnologia">
          <button type="button" id="delete-button" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300">Eliminar</button>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Subir',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'bg-green-500 duration-300 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500',
        cancelButton: 'bg-red-500 duration-300 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-gray-500'
      },
      preConfirm: () => {
        const file = Swal.getPopup().querySelector('#upload-file').files[0];
        const to = Swal.getPopup().querySelector('#to').value;
  
        if (file) {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              const base64Image = reader.result.replace(/^data:image\/[a-z]+;base64,/, '');
              resolve({ base64Image, to });
            };
            reader.readAsDataURL(file);
          });
        } else {
          return { base64Image: null, to };
        }
      },
      didOpen: () => {
        document.getElementById('delete-button').addEventListener('click', () => {
          Swal.showLoading(); // Mostrar loader antes de la solicitud
          fetch('https://technologyline.com.ar/api/page/deleteBanner', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, name }),
          })
            .then(response => response.json())
            .then(data => {
              Swal.close(); // Cerrar loader al obtener respuesta
              if (data.status === 'success') {
                Swal.fire('¡Éxito!', 'Imagen eliminada correctamente', 'success');
                fetchBanners();
              } else {
                Swal.fire('Error', data.message, 'error');
              }
            })
            .catch(error => {
              Swal.close(); // Cerrar loader si hay error
              Swal.fire('Error', error.toString(), 'error');
            });
        });
      }
    })
    .then((result) => {
      if (result.isConfirmed && result.value.base64Image) {
        const { base64Image, to } = result.value;
        Swal.showLoading(); // Mostrar loader antes de la solicitud
        fetch('https://technologyline.com.ar/api/page/uploadBanner', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id, name, image: base64Image, to }),
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Error en la respuesta del servidor');
            }
            return response.json();
          })
          .then(data => {
            Swal.close(); // Cerrar loader al obtener respuesta
            if (data.status === 'success') {
              Swal.fire('¡Éxito!', 'Imagen subida correctamente', 'success');
              fetchBanners();
            } else {
              Swal.fire('Error', data.message, 'error');
            }
          })
          .catch(error => {
            Swal.close(); // Cerrar loader si hay error
            Swal.fire('Error', error.toString(), 'error');
          });
      } else if (result.isConfirmed && !result.value.base64Image) {
        Swal.fire('Error', 'No se seleccionó ninguna imagen para subir.', 'error');
      }
    });
  };
  
  
  console.log(desktopBanners)

  return (
    <section className="flex flex-col items-center gap-3 w-[75%] border-t h-full text-white py-5">
      <div className="flex flex-col gap-5 p-5 rounded-sm w-full">
        <p className="w-full text-2xl text-center font-bold flex flex-col">
          Resoluciones recomendadas: <br /> Modo escritorio (4001x1206px) - Modo mobile (863x1128px)
          <span className="text-center text-sm pt-2 text-gray-300">{`(Es necesario tener dos tipo de banners uno para mobile o tablet si es muy chica, y otro para escritorio, ya que sino no se muestran correctamente.)`}</span>
        </p>

        <main className="flex justify-around gap-10 max-sm:flex-wrap rounded-lg">
          {/* Banners de mobile */}
          <section className="flex bg-slate-700 bg-opacity-25 flex-col w-full items-center rounded-lg">
            <h3 className="flex items-center justify-center font-bold text-xl bg-black border bg-opacity-15 w-full h-14 rounded-t-lg">Banners Mobile</h3>

            <div className="flex flex-col w-full items-center gap-10 p-2 border-x rounded-lg">
              {mobileBanners.map((banner) => (
                <div key={banner.id + new Date()} className="flex flex-col w-full items-center rounded-3xl gap-2 border-b border-white pb-3">
                  {banner.path ? (
                    <img
                      src={banner.path}
                      alt={`Banner mobile ${banner.id}`}
                      className="w-full h-[200px] object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-full px-3 h-24 rounded-lg text-white flex items-center justify-center text-center">
                      Sin banner
                    </div>
                  )}
                  <button
                    onClick={() => handleBannerAction(banner.id, banner.name)}
                    className="px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600"
                  >
                    {`Actualizar Banner ${banner.id - 5}`}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Banners de desktop */}
          <section className="flex bg-slate-700 bg-opacity-25 flex-col w-full items-center rounded-lg">
            <h3 className="flex items-center justify-center font-bold text-xl bg-black border bg-opacity-15 w-full h-14 rounded-t-lg">Banners Escritorio</h3>

            <div className="flex flex-col w-full items-center gap-10 p-2 border-x rounded-lg">
              {desktopBanners.map((banner) => (
                <div key={banner.id + new Date()} className="flex flex-col w-full items-center rounded-3xl gap-2 border-b border-white pb-3">
                  {banner.path ? (
                    <img
                      src={banner.path}
                      alt={`Banner desktop ${banner.id}`}
                      className="w-full h-[200px] object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-full px-3 h-24 rounded-lg text-white flex items-center justify-center text-center">
                      Sin banner
                    </div>
                  )}
                  <button
                    onClick={() => handleBannerAction(banner.id, banner.name)}
                    className="px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600"
                  >
                    {`Actualizar Banner ${banner.id}`}
                  </button>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </section>
  );
}