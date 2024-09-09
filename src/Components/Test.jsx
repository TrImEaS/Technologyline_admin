import { useEffect, useState } from "react";
import Swal from 'sweetalert2';
import 'sweetalert2/src/sweetalert2.scss';

export default function Test() {
  const [desktopBanners, setDesktopBanners] = useState([]);
  const [mobileBanners, setMobileBanners] = useState([]);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = () => {
    fetch('http://localhost:8080/api/page/getBanners')
      .then(res => {
        if (!res.ok) {
          throw new Error('Error fetching banners');
        }
        return res.json();
      })
      .then(data => {
        console.log(data)
        // Filtrar banners según el nombre para móvil y escritorio
        setMobileBanners(data.filter(banner => banner.name.toLowerCase().includes('mobile')));
        setDesktopBanners(data.filter(banner => banner.name.toLowerCase().includes('desktop')));
      })
      .catch(error => console.error(error));
  };

  const handleBannerAction = (type, id) => {
    Swal.fire({
      title: 'Selecciona una acción',
      html: `
        <input type="file" id="upload-file" class="swal2-input" accept="image/*">
        <button id="delete-button" class="swal2-input">Eliminar</button>
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
        if (file) {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              const base64Image = reader.result.replace(/^data:image\/[a-z]+;base64,/, '');
              resolve({ base64Image });
            };
            reader.readAsDataURL(file);
          });
        } else {
          return { base64Image: null };
        }
      },
      didOpen: () => {
        document.getElementById('delete-button').addEventListener('click', () => {
          fetch('http://localhost:8080/api/page/deleteBanner', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'delete', id, type }),
          })
            .then(response => response.json())
            .then(data => {
              if (data.status === 'success') {
                Swal.fire('¡Éxito!', 'Imagen eliminada correctamente', 'success');
                fetchBanners();
              } else {
                Swal.fire('Error', data.message, 'error');
              }
            })
            .catch(error => Swal.fire('Error', error.toString(), 'error'));
        });
      }
    })
    .then((result) => {
      if (result.isConfirmed && result.value.base64Image) {
        const { base64Image } = result.value;
        fetch('http://localhost:8080/api/page/uploadBanners', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'upload', id, type, image: base64Image }),
        })
          .then(response => response.json())
          .then(data => {
            if (data.status === 'success') {
              Swal.fire('¡Éxito!', 'Imagen subida correctamente', 'success');
              fetchBanners();
            } else {
              Swal.fire('Error', data.message, 'error');
            }
          })
          .catch(error => Swal.fire('Error', error.toString(), 'error'));
      }
    });
  };

  return (
    <section className="flex flex-col items-center gap-3 w-[75%] border-t h-full text-white py-5">
      <div className="flex flex-col gap-5 p-5 bg-gray-800 rounded-sm w-full">
        <p className="w-full text-2xl text-center font-bold flex flex-col">
          Resoluciones recomendadas: <br /> Modo escritorio (4001x1206px) - Modo mobile (863x1128px)
          <span className="text-center text-sm pt-2 text-gray-300">{`(Es necesario tener dos tipo de banners uno para mobile o tablet si es muy chica, y otro para escritorio, ya que sino no se muestran correctamente.)`}</span>
        </p>

        <main className="flex justify-around gap-10 max-sm:flex-wrap rounded-lg">
          {/* Banners de mobile */}
          <section className="flex bg-slate-700 flex-col w-full items-center rounded-lg">
            <h3 className="flex items-center justify-center font-bold text-xl bg-slate-500 w-full h-14 rounded-sm">Banners Mobile</h3>

            <div className="flex flex-col w-full items-center gap-10 p-2 border-x rounded-lg">
              {mobileBanners.map((banner) => (
                <div key={banner.ID} className="flex flex-col w-full items-center rounded-3xl gap-2 border-b border-white pb-3">
                  {banner.IMAGE_PATH ? (
                    <img
                      src={banner.IMAGE_PATH}
                      alt={`Banner mobile ${banner.ID}`}
                      className="w-full h-[200px] object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-full px-3 h-24 bg-slate-800 rounded-lg text-white flex items-center justify-center text-center">
                      Sin banner
                    </div>
                  )}
                  <button
                    onClick={() => handleBannerAction('MOBILE', banner.ID)}
                    className="px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600"
                  >
                    {`Actualizar Banner ${banner.ID}`}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Banners de desktop */}
          <section className="flex bg-slate-700 flex-col w-full items-center rounded-lg">
            <h3 className="flex items-center justify-center font-bold text-xl bg-slate-500 w-full h-14 rounded-sm">Banners Escritorio</h3>

            <div className="flex flex-col w-full items-center gap-10 p-2 border-x rounded-lg">
              {desktopBanners.map((banner) => (
                <div key={banner.ID} className="flex flex-col w-full items-center rounded-3xl gap-2 border-b border-white pb-3">
                  {banner.IMAGE_PATH ? (
                    <img
                      src={banner.IMAGE_PATH}
                      alt={`Banner desktop ${banner.ID}`}
                      className="w-full h-[200px] object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-full px-3 h-24 bg-slate-800 rounded-lg text-white flex items-center justify-center text-center">
                      Sin banner
                    </div>
                  )}
                  <button
                    onClick={() => handleBannerAction('DESKTOP', banner.ID)}
                    className="px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600"
                  >
                    {`Actualizar Banner ${banner.ID - 5}`}
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