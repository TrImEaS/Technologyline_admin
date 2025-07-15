import { useEffect, useState } from "react";
import { FaTimesCircle } from "react-icons/fa";
import formattedPrice from "../Utils/useFormattedPrice";
import Swal from "sweetalert2";
import axios from "axios";
import { usePage } from '../Context/PageContext.jsx'
const API_URL = import.meta.env.MODE === 'production' ? import.meta.env.VITE_API_URL_PROD : import.meta.env.VITE_API_URL_DEV;

export default function Orders() {
  const [searchMovement, setSearchMovement] = useState('');
  const [searchClient, setSearchClient] = useState('');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [ordersStates, setOrdersStates] = useState([])
  const [showModal, setShowModal] = useState(false);
  const [filtered, setFiltered] = useState([]);
  const [activeFilters, setActiveFilters] = useState([]);
  const { user } = usePage()
  const bgClasses = {
    'Pedido no procesado': "border-pink-400/95",
    'Pedido en proceso': "border-yellow-400/95",
    'Pedido despachado': "border-blue-500/95",
    'Pedido finalizado': "border-green-500/95",
    'Pedido cancelado': "border-red-500/95",
  };
  const textClasses = {
    'Pedido no procesado': "text-pink-400",
    'Pedido en proceso': "text-yellow-400",
    'Pedido despachado': "text-blue-500",
    'Pedido finalizado': "text-green-500",
    'Pedido cancelado': "text-red-500",
  };
  const canceledOptions = { options: ['Sin stock', 'Cliente se arrepintio', 'Envio caro para cliente', 'Sin respuestas de cliente', 'Cliente inexistente (posible bot)', 'Otros'] }

  useEffect(()=> {
    axios.get(`${API_URL}/api/page/getOrdersStates?t=${Date.now()}`)
    .then(response => setOrdersStates(response.data))
    .catch(error => console.error("Error fetching orders:", error));
  },[])

  const openOrder = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleSearch = () => {
    axios.get(`${API_URL}/api/page/getClientOrders?id=${searchClient}&movement=${searchMovement}&t=${Date.now()}`)
    .then(res => {
      setOrders(res.data);
      const filteredOrders = res.data.filter(o => o.order_header.order_state !== 'Pedido cancelado');
      setFiltered(filteredOrders);
      setActiveFilters(['Pedido no procesado', 'Pedido en proceso', 'Pedido despachado', 'Pedido finalizado']);
    })
    .catch(error => console.error("Error fetching orders:", error));
  };

  const setClientBill = async () => {
    if (!selectedOrder) return;

    const { value: file } = await Swal.fire({
      title: 'Subir factura',
      text: 'Selecciona el archivo de la factura del cliente',
      input: 'file',
      inputAttributes: {
        accept: '.pdf',
        'aria-label': 'Sube la factura del cliente'
      },
      showCancelButton: true,
      confirmButtonText: 'Siguiente',
      cancelButtonText: 'Cancelar',
    });

    if (!file) return;

    const { value: invoiceNumber } = await Swal.fire({
      title: 'Número de factura',
      input: 'text',
      inputLabel: 'Ingresá el número o código de factura',
      inputPlaceholder: 'Ej: E32443-0001',
      inputAttributes: {
        maxlength: 30,
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Subir',
      cancelButtonText: 'Cancelar',
      preConfirm: (value) => {
        if (!value) {
          Swal.showValidationMessage('Debes ingresar un número de factura');
        }
        return value;
      }
    });

    if (!invoiceNumber) return;

    const formData = new FormData();
    formData.append('bill', file);
    formData.append('clientId', selectedOrder.order_header.client_data.id); // <- importante: 'id' no 'clientId'
    formData.append('invoice_number', invoiceNumber); // <- el que se ingresó manualmente
    formData.append('movement', selectedOrder.order_header.movement);

    try {
      await axios.post(`${API_URL}/api/page/uploadClientBill?clientId=${selectedOrder.order_header.client_data.id}&movement=${selectedOrder.order_header.movement}&invoice_number=${invoiceNumber}`, formData);
      Swal.fire('Éxito', 'Factura subida correctamente.', 'success');
      setShowModal(false);
      setSelectedOrder(null);
      handleSearch();
    } catch (error) {
      console.error("Error uploading bill:", error);
      Swal.fire('Error', 'No se pudo subir la factura.', 'error');
    }
  };

  const changeOrderState = () => {
    if (!selectedOrder) return;

    Swal.fire({
      title: 'Cambiar estado del pedido',
      input: 'select',
      inputOptions: ordersStates
        .filter(o => o.id !== 1)
        .reduce((acc, state) => {
          acc[state.id] = state.name;
          return acc;
        }, {}),
      inputPlaceholder: 'Selecciona un estado',
      showCancelButton: true,
      confirmButtonText: 'Cambiar',
      cancelButtonText: 'Cancelar',
    })
    .then(async (result) => {
      if (!result.isConfirmed || !result.value) return;

      let observations = '';

      const selectedState = ordersStates.find(s => s.id === +result.value)?.name;

      if (selectedState === 'Pedido cancelado') {
        const res = await Swal.fire({
          title: '¿Por qué se canceló?',
          input: 'select',
          inputOptions: canceledOptions.options.reduce((acc, option) => {
            acc[option] = option;
            return acc;
          }, {}),
          inputPlaceholder: 'Selecciona una opción',
          showCancelButton: true,
          confirmButtonText: 'Aceptar',
          cancelButtonText: 'Cancelar',
        });

        if (!res.isConfirmed || !res.value) return;
        observations = res.value;
      }

      axios.patch(`${API_URL}/api/page/changeOrderState`, {
        orderId: selectedOrder.order_header.id,
        state: +result.value,
        user: user,
        observations: observations
      })
      .then(() => {
        Swal.fire('Éxito', 'Estado del pedido actualizado correctamente.', 'success');
        setShowModal(false);
        setSelectedOrder(null);
        handleSearch();
      })
      .catch(error => {
        console.error("Error changing order state:", error);
        Swal.fire('Error', 'No se pudo cambiar el estado del pedido.', 'error');
      });
    });
  };

  const toggleFilter = (status) => {
    const next = activeFilters.includes(status)
      ? activeFilters.filter(s => s !== status)
      : [...activeFilters, status];

    setActiveFilters(next);
    if (next.length) {
      setFiltered(orders.filter(o => next.includes(o.order_header.order_state)));
    } else {
      setFiltered(orders);
    }
  };

  const getBackgroundColor = id => bgClasses[id] || "bg-gray-500"
  const getTextColor = id => textClasses[id] || "bg-gray-500"

  return (
    <div className='flex gap-10 flex-wrap w-full p-10 max-sm:flex-col justify-center max-sm:items-center relative'>
      <section className="flex flex-col w-fit justify-center gap-5">
        <h1 className='w-fit max-sm:w-fit text-2xl text-white font-semibold'>Pedidos de clientes</h1>
        
        <article className="w-fit flex gap-5 max-sm:w-fit">
          <div className="w-fit">
            <label htmlFor="client" className="block text-lg font-medium mb-2 text-white">Número de cliente:</label>
            <input
              type="text"
              id="client"
              className="border border-gray-300 p-2 text-black rounded-md w-[300px]"
              placeholder="Buscar por número de cliente"
              value={searchClient}
              onChange={(e) => setSearchClient(e.target.value)}
            />
          </div>

          <div className="w-fit">
            <label htmlFor="movement" className="block text-lg font-medium mb-2 text-white">Número de pedido:</label>
            <input
              type="text"
              id="movement"
              className="border border-gray-300 p-2 text-black rounded-md w-[300px]"
              placeholder="Buscar por número de pedido"
              value={searchMovement}
              onChange={(e) => setSearchMovement(e.target.value)}
            />
          </div>
        </article>

        <article className="w-full justify-center flex">
          <button
            className="w-[300px] h-10 rounded-3xl hover:scale-105 text-black font-bold duration-300 bg-white/75 disabled:opacity-50"
            onClick={handleSearch}
          >
            Buscar
          </button>
        </article>

        <div className="flex flex-wrap bg-black/30 rounded-lg justify-center items-center w-full mt-10 p-2 py-3 gap-3">
          {Object.entries(bgClasses).map(([status, color], i) => (
            <button
              key={status}
              onClick={() => toggleFilter(status)}
              className={`rounded-lg shadow w-fit flex gap-4 items-center justify-center text-sm text-left ${activeFilters.includes(status) ? 'ring-4 ring-green-400' : ''}`}
            >
              <div key={i} className="flex items-center border border-white p-1 rounded-lg gap-2">
                <div className={`${color} w-4 h-4 rounded border-4`} />
                <span className="text-slate-100">{status.replace('Pedido','').toUpperCase()}</span>
              </div>
            </button>
          ))}
        </div>

        {activeFilters.length > 0 && (
          <button
            onClick={() => { setActiveFilters([]); setFiltered(orders); }}
            className="mb-2 text-sm text-blue-600 font-semibold bg-black/40 w-fit mx-auto px-2 py-1 rounded-lg hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </section>


      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
        {filtered.map(o => (
          <div 
            key={o.order_header.id} 
            onClick={() => openOrder(o)}
            className={`border-[10px] ${getBackgroundColor(o.order_header.order_state)} p-4 bg-black/30 text-white rounded-lg border hover:scale-105 cursor-pointer transition`}
          >
            <p className={`uppercase italic ${getTextColor(o.order_header.order_state)}`}><strong>Pedido #{o.order_header.movement.toString().padStart(8, '0')}</strong></p>
            <p className={`${getTextColor(o.order_header.order_state)}`}><strong>Estado:</strong> {o.order_header.order_state.replace('Pedido','').toUpperCase()}</p>
            <p><strong className={`${getTextColor(o.order_header.order_state)}`}>Observacion:</strong> {o.order_header.observations}</p>
            <p><strong className={`${getTextColor(o.order_header.order_state)}`}>N° de cliente:</strong> {o.order_header.client_data.id}</p>
            <p><strong className={`${getTextColor(o.order_header.order_state)}`}>Atendido por:</strong> <span className="uppercase">{o.order_header.user || '- - -'}</span></p>
            <p><strong className={`${getTextColor(o.order_header.order_state)}`}>Total:</strong> ${formattedPrice(o.order_header.total_price)}</p>
            <p><strong className={`${getTextColor(o.order_header.order_state)}`}>Fecha:</strong> {new Date(o.order_header.date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric'})}</p>
            <p><strong className={`${getTextColor(o.order_header.order_state)}`}>Factura:</strong> {o.order_header.invoice_number === 0 ? 'Sin factura adjunta' : 'Con factura adjunta'}</p>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="col-span-2 md:col-span-3 lg:col-span-4 p-4 bg-white rounded-lg border shadow w-full text-center">
            <p>No se encontraron pedidos.</p>
          </div>
        )}
      </section>

      {showModal && selectedOrder && (
        <div className={`fixed inset-0 flex items-center justify-center z-50`}>
          <div className={`border-8 bg-white ${getBackgroundColor(selectedOrder.order_header.order_state)} w-[80%] max-lg:w-[95%] min-h-[80vh] justify-between max-h-[90vh] flex flex-col p-8 max-sm:p-5 rounded-lg shadow-lg border border-black overflow-auto`}>
            <div className="flex-col relative flex gap-6 w-full">
              <div className="absolute right-2">
                <button onClick={() => setShowModal(false)} className="text-black/50 hover:text-black/80 text-2xl duration-300">
                  <FaTimesCircle />
                </button>
              </div>

              <div>
                <h2 className="text-xl tracking-wide"><strong className="text-slate-800">Estado:</strong>
                <span className="ml-1 font-bold text-slate-800">{selectedOrder.order_header.order_state.replace('Pedido','').toUpperCase()}</span></h2>
                <h2 className="text-xl tracking-wide"><strong className="text-slate-800">Pedido #{selectedOrder.order_header.movement.toString().padStart(8, '0')}</strong></h2>
              </div>
              
              {/* Datos del cliente */}
              <div>
                <h2 className="text-lg text-slate-800"><strong>Datos de pedido:</strong></h2>
                <p className="text-sm max-sm:text-[12px]"><strong className="text-slate-800">-Atendido por:</strong> <span className="uppercase">{selectedOrder.order_header.user}</span></p>
                <p className="text-sm max-sm:text-[12px]"><strong className="text-slate-800">-Observacion:</strong> {selectedOrder.order_header.observations}</p>
                <p className="text-sm max-sm:text-[12px]"><strong className="text-slate-800">-Numero cliente:</strong> {selectedOrder.order_header.client_data.id}</p>
                <p className="text-sm max-sm:text-[12px]"><strong className="text-slate-800">-Nombre cliente:</strong> {selectedOrder.order_header.client_data.fullname}</p>
                <p className="text-sm max-sm:text-[12px]"><strong className="text-slate-800">-DNI/CUIL:</strong> {selectedOrder.order_header.client_data.dni}</p>
                <p className="text-sm max-sm:text-[12px]"><strong className="text-slate-800">-Celular:</strong> {selectedOrder.order_header.client_data.phone}</p>
                <p className="text-sm max-sm:text-[12px]"><strong className="text-slate-800">-Email:</strong> {selectedOrder.order_header.client_data.email}</p>
                <p className="text-sm max-sm:text-[12px]"><strong className="text-slate-800">-Numero de factura:</strong> {selectedOrder.order_header.invoice_number === 0 ? 'Sin adjuntar' : selectedOrder.order_header.invoice_number}</p>
                <p className="text-sm max-sm:text-[12px]"><strong className="text-slate-800">-Dirección de facturacion:</strong> {selectedOrder.order_header.client_data.address}, CP {selectedOrder.order_header.client_data.postal_code}</p>
                <p className="text-sm max-sm:text-[12px]"><strong className="text-slate-800">-Dirección de entrega:</strong> {selectedOrder.order_header.address}</p>
                <p className="text-sm max-sm:text-[12px]"><strong className="text-slate-800">-Condición de venta:</strong> {selectedOrder.order_header.payment}</p>
                <p className="text-sm max-sm:text-[12px]"><strong className="text-slate-800">-Fecha de pedido:</strong> {new Date(selectedOrder.order_header.date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric'})}</p>
                <p className="text-sm max-sm:text-[12px]"><strong className="text-slate-800">-Precio total:</strong> ${formattedPrice(selectedOrder.order_header.total_price)}</p>
                <p className="text-sm max-sm:text-[12px]"><strong className="text-slate-800">-Vendido por pagina:</strong> {selectedOrder.order_header.company}</p>
              </div>

              {/* Detalles */}
              <div className="flex flex-col w-full">
                <h2 className="text-lg text-slate-800"><strong>Detalle de pedido:</strong></h2>

                {/* Card layout for mobile */}
                <div className="flex flex-col gap-4 sm:hidden">
                  {selectedOrder.order_details.map((d, i) => (
                    <div key={i} className="border-b first:border-t border-page-blue-normal p-3 text-sm max-md:text-[12px]">
                      <p><strong className="text-slate-800">SKU:</strong> {d.sku}</p>
                      <p><strong className="text-slate-800">Descripción:</strong> <span className="tracking-tight">{d.name.replace(/EAN(?::\s*|\s+)\d{5,}/gi, '')}</span></p>
                      <p><strong className="text-slate-800">Cantidad:</strong> {d.quantity}</p>
                      <p><strong className="text-slate-800">Precio:</strong> ${formattedPrice(d.price)}</p>
                    </div>
                  ))}
                </div>

                {/* Table layout for desktop */}
                <table className="w-full mb-4 text-left hidden sm:table">
                  <thead>
                    <tr>
                      <th className="p-2 text-sm max-md:text-[12px] text-slate-800">SKU</th>
                      <th className="p-2 text-sm max-md:text-[12px] text-slate-800">DESCRIPCION</th>
                      <th className="p-2 text-sm max-md:text-[12px] text-slate-800 text-center">CANTIDAD</th>
                      <th className="p-2 text-sm max-md:text-[12px] text-slate-800 text-center">PRECIO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.order_details.map((d, i) => (
                      <tr key={i} className="border-t border-black/50 border-page-blue-normal">
                        <td className="p-2 text-xs max-md:text-[10px]">{d.sku}</td>
                        <td className="p-2 text-xs max-md:text-[10px] tracking-tight">{d.name.replace(/EAN(?::\s*|\s+)\d{5,}/gi, '')}</td>
                        <td className="p-2 text-xs max-md:text-[10px] text-center">{d.quantity}</td>
                        <td className="p-2 text-xs max-md:text-[10px] text-center">${formattedPrice(d.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <section className="flex justify-center gap-3">
              <div className="h-full flex items-end justify-center mt-4">
                <button
                  title="Descargar factura"
                  className='bg-black/50 hover:bg-black/80 text-white px-4 py-2 rounded duration-300 disabled:opacity-50'
                  onClick={setClientBill}
                >
                  Subir factura
                </button>
              </div>

               <div className="h-full flex items-end justify-center mt-4">
                <button
                  title="Cambiar estado del pedido"
                  className='bg-black/50 hover:bg-black/80 text-white px-4 py-2 rounded duration-300 disabled:opacity-50'
                  onClick={changeOrderState}
                >
                  Cambiar estado del pedido
                </button>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  )
}