import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { transactionsAPI, storage } from '../api';

const History = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = storage.getUserId();

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await transactionsAPI.getTransactions(userId);
        setTransactions(data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '18px' }}>Chargement...</div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 className="display-md" style={{ marginBottom: '8px' }}>Historique des Transactions</h1>
        <p className="body-md" style={{ color: 'var(--text-muted)' }}>Consultez toutes vos opérations passées</p>
      </div>

      {/* Transactions List */}
      {transactions.length > 0 ? (
        <>
          <div className="card">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              {transactions.map((transaction, idx) => (
                <div
                  key={transaction.id}
                  style={{
                    padding: '20px',
                    background: idx % 2 === 0 ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = idx % 2 === 0 ? 'var(--bg-tertiary)' : 'var(--bg-secondary)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: transaction.type === 'buy' ? 'var(--success-bg)' : 'var(--danger-bg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {transaction.type === 'buy' ? (
                        <ArrowDownRight size={24} color="var(--success)" />
                      ) : (
                        <ArrowUpRight size={24} color="var(--danger)" />
                      )}
                    </div>

                    <div>
                      <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {transaction.type === 'buy' ? 'Achat' : 'Vente'} - {transaction.symbol}
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} />
                        {formatDate(transaction.date)}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      {transaction.quantity} × {formatCurrency(transaction.price)}
                    </div>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: transaction.type === 'buy' ? 'var(--danger)' : 'var(--success)'
                    }}>
                      {transaction.type === 'buy' ? '-' : '+'}{formatCurrency(transaction.total)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Card */}
          <div style={{ marginTop: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            <div className="card">
              <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>Total Investi</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {formatCurrency(transactions.filter(t => t.type === 'buy').reduce((sum, t) => sum + t.total, 0))}
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>Nombre de Transactions</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {transactions.length}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '18px', marginBottom: '16px' }}>
            Aucune transaction enregistrée
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Les transactions s'afficheront automatiquement lorsque vous ajouterez des positions
          </p>
        </div>
      )}
    </div>
  );
};

export default History;
