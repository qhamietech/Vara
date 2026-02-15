import React, { useState, useEffect } from 'react';
import { 
  Shirt, 
  ShoppingBag, 
  Footprints, 
  Watch, 
  Glasses, 
  GraduationCap, 
  CloudSun, 
  Plus, 
  X,
  Image as ImageIcon,
  Upload,
  ChevronLeft,
  Triangle,
  Trash2,
  CheckCircle,
  WashingMachine,
  Sparkles,
  User
} from 'lucide-react';

// Avatar Data
const baseAvatars = [
  { id: 'standard', name: 'Classic Fit', path: '/My Avatar.jpg' },
  { id: 'pear', name: 'Pear Shape', path: '/My Avatar 3.jpg' },
  { id: 'slim', name: 'slim Fit', path: '/My Avatar 2.jpg' },
];

export default function App() {
  const [activeAvatar, setActiveAvatar] = useState(null); 
  const [userGarment, setUserGarment] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null); 
  const [uploadTarget, setUploadTarget] = useState("Dresses"); 
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showLaundry, setShowLaundry] = useState(false);
  
  const [closetData, setClosetData] = useState({
    "Dresses": [], "Tops": [], "Bottoms": [],
    "Shoes": [], "Bags": [], "Accessories": [],
    "Jewelry": [], "Hats": [], "Outerwear": []
  });

  const [laundryList, setLaundryList] = useState([]);
  const LAUNDRY_LIMIT = 10;

  const categories = Object.keys(closetData);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const iconMap = {
    "Dresses": (
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '6px', height: '4px', border: '1.5px solid currentColor', borderBottom: 'none', borderRadius: '2px 2px 0 0' }} />
        <Triangle size={12} style={{ marginTop: '-2px' }} />
      </div>
    ),
    "Tops": <Shirt size={14} />, 
    "Bottoms": (
      <div style={{ display: 'flex', gap: '1px' }}>
        <div style={{ width: '5px', height: '12px', border: '1.5px solid currentColor', borderRadius: '1px' }} />
        <div style={{ width: '5px', height: '12px', border: '1.5px solid currentColor', borderRadius: '1px' }} />
      </div>
    ),
    "Shoes": <Footprints size={14} />,
    "Bags": <ShoppingBag size={14} />,
    "Accessories": <Glasses size={14} />,
    "Jewelry": <Watch size={14} />,
    "Hats": <GraduationCap size={14} />,
    "Outerwear": <CloudSun size={14} />
  };

  const processUrlBackground = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous"; 
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i] > 250 && data[i+1] > 250 && data[i+2] > 250) {
            data[i + 3] = 0; 
          }
        }
        ctx.putImageData(imageData, 0, 0);
        const finalCanvas = document.createElement('canvas');
        const finalCtx = finalCanvas.getContext('2d');
        finalCanvas.width = canvas.width;
        finalCanvas.height = canvas.height;
        finalCtx.filter = 'blur(0.5px)';
        finalCtx.drawImage(canvas, 0, 0);
        resolve(finalCanvas.toDataURL('image/png'));
      };
      img.src = url;
    });
  };

  const processImageBackground = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const cleanedUrl = await processUrlBackground(e.target.result);
        resolve({ id: Date.now(), url: cleanedUrl, category: uploadTarget });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async () => {
    if (!userGarment) return;
    setIsProcessing(true);
    try {
      const processedItem = await processImageBackground(userGarment);
      setClosetData(prev => ({
        ...prev,
        [uploadTarget]: [...prev[uploadTarget], processedItem]
      }));
      setNotification({ msg: `Added to ${uploadTarget}!`, category: uploadTarget });
      setUserGarment(null);
      setShowUploadPanel(false);
    } catch (err) {
      console.error("Processing failed", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const removeItem = (category, id) => {
    setClosetData(prev => ({ ...prev, [category]: prev[category].filter(item => item.id !== id) }));
  };

  const sendToLaundry = (category, item) => {
    if (laundryList.length >= LAUNDRY_LIMIT) {
        setNotification({ msg: "Laundry chair is full!" });
        return;
    }
    setClosetData(prev => ({ ...prev, [category]: prev[category].filter(i => i.id !== item.id) }));
    setLaundryList(prev => [...prev, { ...item, originalCategory: category }]);
    setNotification({ msg: "Sent to laundry chair!", category });
  };

  const returnFromLaundry = (item) => {
    setLaundryList(prev => prev.filter(i => i.id !== item.id));
    setClosetData(prev => ({
      ...prev,
      [item.originalCategory]: [...prev[item.originalCategory], item]
    }));
    setNotification({ msg: "Item is clean & back on shelf!" });
  };

  const washEverything = () => {
    if (laundryList.length === 0) return;
    const newClosetData = { ...closetData };
    laundryList.forEach(item => {
      newClosetData[item.originalCategory] = [...newClosetData[item.originalCategory], item];
    });
    setClosetData(newClosetData);
    setLaundryList([]);
    setNotification({ msg: "Laundry clear! VARA is ready." });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100dvh', backgroundColor: '#111', fontFamily: 'sans-serif' }}>
      
      <div style={{ 
        position: 'relative', width: '100%', maxWidth: '430px', height: '90%', 
        maxHeight: '932px', backgroundImage: 'url("/room-bg.png")', 
        backgroundSize: '100% 100%', overflow: 'hidden', borderRadius: '40px'
      }}>

        {/* AVATAR SELECTION OVERLAY */}
        {!activeAvatar && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(255, 255, 255, 0.95)',
            zIndex: 500, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '40px', textAlign: 'center'
          }}>
            <h1 style={{ fontSize: '28px', color: '#B19CD9', margin: '0 0 10px 0' }}>VARA</h1>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '40px' }}>
              Every body is a fashion body.<br/>Select your profile to begin.
            </p>
            
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              {baseAvatars.map(av => (
                <div 
                  key={av.id} 
                  onClick={() => setActiveAvatar(av)}
                  style={{ cursor: 'pointer', textAlign: 'center' }}
                >
                  <div style={{ 
                    width: '120px', height: '180px', borderRadius: '20px', overflow: 'hidden',
                    border: '3px solid white', boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                    marginBottom: '10px', transition: '0.3s'
                  }}>
                    <img src={av.path} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={av.name} />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#444' }}>{av.name}</span>
                </div>
              ))}
            </div>
            <p style={{ marginTop: '40px', fontSize: '10px', color: '#aaa', fontStyle: 'italic' }}>
              More inclusive shapes arriving soon.
            </p>
          </div>
        )}

        {/* PROFILE SWITCHER */}
        {activeAvatar && (
          <button 
            onClick={() => setActiveAvatar(null)}
            style={{ position: 'absolute', top: '30px', left: '25px', zIndex: 30, background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer', backdropFilter: 'blur(10px)' }}
          >
            <User size={16} />
          </button>
        )}

        {/* ACTIVE AVATAR - Moved Very Close / Furthest from Mirror */}
        {activeAvatar && (
          <div style={{
            position: 'absolute',
            bottom: '-5%',        // Pulls the avatar "out" of the screen/closer to camera
            left: '50%',          
            transform: 'translateX(-50%)', // Centered for the close-up perspective
            width: '115%',        // Significantly larger to show proximity
            height: '110%', 
            zIndex: 5,
            pointerEvents: 'none',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end' 
          }}>
            <img 
              src={activeAvatar.path} 
              style={{ 
                height: '100%', 
                width: 'auto',
                objectFit: 'contain', 
                filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.4))'
              }} 
              alt="Model" 
            />
          </div>
        )}

        {/* NOTIFICATION */}
        {notification && (
          <div style={{
            position: 'absolute', top: '30px', left: '50%', transform: 'translateX(-50%)',
            background: 'white', padding: '10px 18px', borderRadius: '25px', zIndex: 200,
            display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
            border: '1.5px solid #B19CD9', animation: 'slideIn 0.4s ease-out'
          }}>
            <CheckCircle size={16} color="#B19CD9" />
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#444' }}>{notification.msg}</span>
          </div>
        )}

        {/* LAUNDRY CHAIR */}
        <div 
          onClick={() => setShowLaundry(true)}
          style={{
            position: 'absolute', bottom: '18%', right: '18.5%', width: '38px', height: '38px',
            cursor: 'pointer', zIndex: 20, display: 'flex', flexDirection: 'column', 
            alignItems: 'center', justifyContent: 'center',
            background: laundryList.length >= LAUNDRY_LIMIT ? 'rgba(255,77,77,0.2)' : 'rgba(255,255,255,0.1)', 
            backdropFilter: 'blur(5px)', borderRadius: '10px', border: laundryList.length >= LAUNDRY_LIMIT ? '1px solid #ff4d4d' : '0.5px solid rgba(255,255,255,0.2)',
            color: laundryList.length >= LAUNDRY_LIMIT ? '#ff4d4d' : (laundryList.length > 0 ? '#B19CD9' : '#fff')
          }}
        >
          {laundryList.length > 0 && (
            <div style={{
              position: 'absolute', top: '-6px', right: '-6px', background: laundryList.length >= LAUNDRY_LIMIT ? '#ff4d4d' : '#B19CD9', 
              color: 'white', fontSize: '8px', width: '14px', height: '14px', borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: '1px solid white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)', animation: 'bounce 2s infinite'
            }}>
              {laundryList.length}
            </div>
          )}
          <WashingMachine size={10} />
          <span style={{ fontSize: '4.5px', fontWeight: 'bold', marginTop: '1px' }}>
            {laundryList.length >= LAUNDRY_LIMIT ? 'FULL' : 'LAUNDRY'}
          </span>
        </div>

        {/* SHELF GRID */}
        <div style={{
          position: 'absolute', top: '30.3%', right: '8.2%', width: '33%', height: '33%',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)', gap: '4px', zIndex: 10
        }}>
          {categories.map((cat) => (
            <div key={cat} onClick={() => setSelectedCategory(cat)}
              style={{ 
                position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(5px)', borderRadius: '6px',
                border: '0.5px solid rgba(255,255,255,0.2)', color: '#fff'
              }}
            >
              {closetData[cat].length > 0 && (
                <div style={{
                  position: 'absolute', top: '-4px', right: '-4px', background: '#B19CD9', color: 'white',
                  fontSize: '7px', width: '14px', height: '14px', borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: '1px solid white'
                }}>
                  {closetData[cat].length}
                </div>
              )}
              <div style={{ color: closetData[cat].length > 0 ? '#B19CD9' : '#fff' }}>{iconMap[cat]}</div>
              <span style={{ fontSize: '5px', fontWeight: 'bold', color: '#B19CD9', marginTop: '1px' }}>{cat.toUpperCase()}</span>
            </div>
          ))}
        </div>

        {/* PREVIEW MODAL */}
        {selectedCategory && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'white', zIndex: 100, display: 'flex', flexDirection: 'column', padding: '40px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }} onClick={() => setSelectedCategory(null)}>
                <ChevronLeft size={20} color="#333" />
                <h2 style={{ color: '#333', margin: 0, fontSize: '16px' }}>{selectedCategory}</h2>
              </div>
              <X size={20} color="#999" onClick={() => setSelectedCategory(null)} style={{ cursor: 'pointer' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', overflowY: 'auto' }}>
              {closetData[selectedCategory].map(item => (
                <div key={item.id} style={{ position: 'relative', background: '#f9f9f9', padding: '8px', borderRadius: '10px', border: '1px solid #eee', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <img src={item.url} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                   <div style={{ position: 'absolute', top: '2px', right: '2px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <button disabled={laundryList.length >= LAUNDRY_LIMIT} onClick={() => sendToLaundry(selectedCategory, item)} style={{ background: laundryList.length >= LAUNDRY_LIMIT ? '#ffebee' : '#e0e0e0', border: 'none', borderRadius: '4px', cursor: laundryList.length >= LAUNDRY_LIMIT ? 'not-allowed' : 'pointer', padding: '3px' }}>
                        <WashingMachine size={10} color={laundryList.length >= LAUNDRY_LIMIT ? "#ff4d4d" : "#666"} />
                    </button>
                    <button onClick={() => removeItem(selectedCategory, item.id)} style={{ background: 'rgba(255, 77, 77, 0.1)', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '3px' }}>
                        <Trash2 size={10} color="#ff4d4d" />
                    </button>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LAUNDRY MODAL */}
        {showLaundry && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'white', zIndex: 110, display: 'flex', flexDirection: 'column', padding: '40px 20px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <WashingMachine size={20} color={laundryList.length >= LAUNDRY_LIMIT ? "#ff4d4d" : "#B19CD9"} />
                <h2 style={{ color: '#333', margin: 0, fontSize: '16px' }}>Laundry Chair {laundryList.length >= LAUNDRY_LIMIT && "(FULL)"}</h2>
              </div>
              <X size={20} color="#999" onClick={() => setShowLaundry(false)} style={{ cursor: 'pointer' }} />
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {laundryList.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#999', fontSize: '13px', marginTop: '50px' }}>The chair is empty! All clothes are clean.</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        {laundryList.map(item => (
                            <div key={item.id} style={{ background: '#f4f4f4', padding: '8px', borderRadius: '12px', textAlign: 'center' }}>
                                <img src={item.url} style={{ width: '100%', height: '60px', objectFit: 'contain', opacity: 0.6 }} />
                                <button onClick={() => returnFromLaundry(item)} style={{ background: '#B19CD9', color: 'white', border: 'none', borderRadius: '8px', fontSize: '8px', padding: '5px', marginTop: '5px', width: '100%', fontWeight: 'bold', cursor: 'pointer' }}>
                                    <Sparkles size={8} style={{ marginRight: '2px' }} /> CLEAN
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {laundryList.length > 0 && (
                <button onClick={washEverything} style={{ marginTop: '20px', background: '#B19CD9', color: 'white', border: 'none', borderRadius: '15px', padding: '15px', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(177, 156, 217, 0.3)' }}>
                    <Sparkles size={16} /> WASH EVERYTHING
                </button>
            )}
          </div>
        )}

        {/* UPLOAD PANEL & FAB */}
        {!showUploadPanel && (
          <button onClick={() => setShowUploadPanel(true)} style={{ position: 'absolute', bottom: '30px', right: '25px', width: '46px', height: '46px', borderRadius: '50%', background: '#B19CD9', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30, boxShadow: '0 4px 15px rgba(177, 156, 217, 0.4)' }}>
            <Plus size={22} />
          </button>
        )}

        {showUploadPanel && (
          <div style={{ position: 'absolute', bottom: '0', left: '0', width: '100%', background: 'white', padding: '20px 20px 40px', borderTopLeftRadius: '30px', borderTopRightRadius: '30px', zIndex: 40, boxShadow: '0 -10px 30px rgba(0,0,0,0.1)', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#B19CD9', margin: 0 }}>NEW GARMENT</p>
              <X size={18} onClick={() => setShowUploadPanel(false)} style={{ cursor: 'pointer', color: '#999' }} />
            </div>
            <select value={uploadTarget} onChange={(e) => setUploadTarget(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #eee', fontSize: '12px', marginBottom: '15px', outline: 'none' }}>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input type="file" id="f-up" hidden onChange={(e) => setUserGarment(e.target.files[0])} />
              <label htmlFor="f-up" style={{ background: '#f8f8f8', padding: '12px 5px', borderRadius: '12px', textAlign: 'center', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', border: '1px solid #eee' }}>
                <ImageIcon size={14}/> {userGarment ? "SELECTED" : "CHOOSE"}
              </label>
              <button onClick={handleUpload} style={{ background: '#B19CD9', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '11px' }}>
                <Upload size={14}/> {isProcessing ? "WORKING..." : "UPLOAD"}
              </button>
            </div>
          </div>
        )}

      </div>
      <style>{`
        @keyframes slideIn { from { transform: translate(-50%, -60px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
      `}</style>
    </div>
  );
}