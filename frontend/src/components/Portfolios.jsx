import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, X, Edit2, Trash2, Check } from 'lucide-react';
import { storage } from '../api';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Portfolios = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [currentPortfolio, setCurrentPortfolio] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const userId = storage.getUserId();

  const fetchPortfolios = async () => {
    try {
      const response = await axios.get(`${API}/portfolios?user_id=${userId}`);
      setPortfolios(response.data);
      
      // Get current active portfolio
      const activeId = localStorage.getItem('activePortfolioId');
      if (activeId) {
        const active = response.data.find(p => p.id === activeId);
        setCurrentPortfolio(active || response.data[0]);
      } else if (response.data.length > 0) {
        setCurrentPortfolio(response.data[0]);
        localStorage.setItem('activePortfolioId', response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching portfolios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const handleCreatePortfolio = async () => {
    try {
      await axios.post(`${API}/portfolios?user_id=${userId}`, formData);
      await fetchPortfolios();
      setShowCreateModal(false);
      setFormData({ name: '', description: '' });
    } catch (error) {
      console.error('Error creating portfolio:', error);
      alert('Erreur lors de la création du portefeuille');
    }
  };

  const handleSwitchPortfolio = (portfolio) => {
    setCurrentPortfolio(portfolio);
    localStorage.setItem('activePortfolioId', portfolio.id);
    window.location.reload(); // Reload to update all components
  };

  const handleDeletePortfolio = async (portfolioId) => {
    if (!window.confirm('Supprimer ce portefeuille et toutes ses positions ?')) return;
    try {
      await axios.delete(`${API}/portfolios/${portfolioId}?user_id=${userId}`);
      await fetchPortfolios();
    } catch (error) {
      console.error('Error deleting portfolio:', error);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '18px' }}>Chargement...</div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="display-md" style={{ marginBottom: '8px' }}>Mes Portefeuilles</h1>
          <p className="body-md" style={{ color: 'var(--text-muted)' }}>Gérez plusieurs portefeuilles séparés</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={20} />
          Nouveau portefeuille
        </button>
      </div>

      {/* Current Portfolio */}
      {currentPortfolio && (
        <div className="card" style={{ marginBottom: '32px', background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)', border: '2px solid var(--accent-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Briefcase size={32} color="var(--accent-primary)" />
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Portefeuille actif</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {currentPortfolio.name}
              </div>
              {currentPortfolio.description && (
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {currentPortfolio.description}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Portfolios List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {portfolios.map(portfolio => (
          <div 
            key={portfolio.id} 
            className="card"
            style={{
              cursor: 'pointer',
              border: currentPortfolio?.id === portfolio.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
              position: 'relative'
            }}
            onClick={() => handleSwitchPortfolio(portfolio)}
          >
            {currentPortfolio?.id === portfolio.id && (
              <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={14} />
                  Actif
                </span>
              </div>
            )}

            <div style={{ marginBottom: '12px' }}>
              <Briefcase size={24} color="var(--accent-primary)" style={{ marginBottom: '8px' }} />
              <h3 className="h3" style={{ marginBottom: '4px' }}>{portfolio.name}</h3>
              {portfolio.description && (
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{portfolio.description}</p>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Créé le {new Date(portfolio.created_at).toLocaleDateString('fr-FR')}
              </div>
              {portfolios.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePortfolio(portfolio.id);
                  }}
                  style={{
                    padding: '6px',
                    border: 'none',
                    borderRadius: '6px',
                    background: 'var(--danger-bg)',
                    color: 'var(--danger)',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {portfolios.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <Briefcase size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '18px', marginBottom: '16px' }}>
            Aucun portefeuille
          </p>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={20} />
            Créer mon premier portefeuille
          </button>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '24px'
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', position: 'relative' }}>
            <button
              onClick={() => setShowCreateModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '8px'
              }}
            >
              <X size={24} />
            </button>

            <h2 className="h2" style={{ marginBottom: '24px' }}>Nouveau portefeuille</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                  Nom
                </label>
                <input
                  type="text"
                  placeholder="Ex: Portefeuille Personnel, Trading, Long-terme"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                  Description (optionnel)
                </label>
                <textarea
                  placeholder="Description de ce portefeuille..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button 
                className="btn-primary" 
                onClick={handleCreatePortfolio}
                disabled={!formData.name}
                style={{ width: '100%', marginTop: '8px' }}
              >
                <Plus size={20} />
                Créer le portefeuille
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolios;
