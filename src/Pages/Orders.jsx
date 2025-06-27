import { useEffect, useState } from "react";
import { FaTimesCircle } from "react-icons/fa";
import formattedPrice from "../Utils/useFormattedPrice";
import Swal from "sweetalert2";
import axios from "axios";
const API_URL = import.meta.env.MODE === 'production' ? import.meta.env.VITE_API_URL_PROD : import.meta.env.VITE_API_URL_DEV;

export default function Orders() {
  const [searchMovement, setSearchMovement] = useState('');
  const [searchClient, setSearchClient] = useState('');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [ordersStates, setOrdersStates] = useState([])
  const [showModal, setShowModal] = useState(false);

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
    .then(response => setOrders(response.data))
    .catch(error => console.error("Error fetching orders:", error));
  }

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
      inputOptions: ordersStates.filter(o => o.id !== 1).reduce((acc, state) => {
        acc[state.id] = state.name;
        return acc;
      }, {}),
      inputPlaceholder: 'Selecciona un estado',
      showCancelButton: true,
      confirmButtonText: 'Cambiar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        axios.patch(`${API_URL}/api/page/changeOrderState`, {
          orderId: selectedOrder.order_header.id,
          state: +result.value
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
      }
    });
  }

  return (
    <div className='flex gap-10 flex-wrap w-full p-10 max-sm:flex-col justify-center max-sm:items-center relative'>
      <section className="flex flex-col w-fit justify-center gap-6">
        <h1 className='w-fit max-sm:w-fit text-2xl text-white font-semibold'>Pedidos de clientes</h1>
        
        <article className="w-fit flex gap-5 max-sm:w-fit mb-4">
          <div className="w-fit mb-4">
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

          <div className="w-fit mb-4">
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
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {orders.map(o => (
          <div 
            key={o.order_header.id} 
            onClick={() => openOrder(o)}
            className="p-4 bg-white rounded-lg border shadow hover:shadow-page-blue-normal hover:shadow-sm hover:border-page-blue-normal cursor-pointer transition"
          >
            <p className="uppercase italic"><strong className="text-slate-800">Pedido #{o.order_header.movement.toString().padStart(8, '0')}</strong></p>
            <p><strong className="text-slate-800">Numero de cliente:</strong> {o.order_header.client_data.id}</p>
            <p><strong className="text-slate-800">Estado:</strong> {o.order_header.order_state}</p>
            <p><strong className="text-slate-800">Total:</strong> ${formattedPrice(o.order_header.total_price)}</p>
            <p><strong className="text-slate-800">Fecha:</strong> {new Date(o.order_header.date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric'})}</p>
            <p><strong className="text-slate-800">Factura:</strong> {o.order_header.invoice_number === 0 ? 'Sin factura adjunta' : 'Con factura adjunta'}</p>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 p-4 bg-white rounded-lg border shadow text-center">
            <p>No se encontraron pedidos.</p>
          </div>
        )}
      </section>

      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-[80%] max-lg:w-[95%] min-h-[80vh] justify-between max-h-[90vh] flex flex-col p-8 max-sm:p-5 rounded-lg shadow-lg overflow-auto">
            <div className="flex-col relative flex gap-6 w-full">
              <div className="absolute right-2">
                <button onClick={() => setShowModal(false)} className="text-blue-500 hover:text-blue-700 text-2xl duration-300">
                  <FaTimesCircle />
                </button>
              </div>

              <div>
                <h2 className="text-xl tracking-wide"><strong className="text-slate-800">Estado:</strong>
                <span className="ml-1 font-bold text-slate-800">{selectedOrder.order_header.order_state}</span></h2>
                <h2 className="text-xl tracking-wide"><strong className="text-slate-800">Pedido #{selectedOrder.order_header.movement.toString().padStart(8, '0')}</strong></h2>
              </div>
              
              {/* Datos del cliente */}
              <div>
                <h2 className="text-lg text-slate-800"><strong>Datos de pedido:</strong></h2>
                <p className="text-sm max-sm:text-[12px]"><strong className="text-slate-800">-Numero de cliente:</strong> {selectedOrder.order_header.client_data.id}</p>
                <p className="text-sm max-sm:text-[12px]"><strong className="text-slate-800">-Nombre:</strong> {selectedOrder.order_header.client_data.fullname}</p>
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
                      <tr key={i} className="border-t border-page-blue-normal">
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
                  className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded duration-300 disabled:opacity-50'
                  onClick={setClientBill}
                >
                  Subir factura
                </button>
              </div>

               <div className="h-full flex items-end justify-center mt-4">
                <button
                  title="Cambiar estado del pedido"
                  className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded duration-300 disabled:opacity-50'
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