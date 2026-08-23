// WithdrawalCarousel.jsx
import React, { useMemo } from 'react';
import { generateWithdrawalPool } from '../../data/names';
import {
  LuTrendingUp as TrendingUp,
  LuShieldCheck as ShieldCheck,
} from 'react-icons/lu';
import './WithdrawalCarousel.css';

export const WithdrawalCarousel = ({ compact = false, className = '' }) => {
  const pool = useMemo(() => generateWithdrawalPool(), []);
  const row1 = pool.slice(0, 50);
  const row2 = pool.slice(50, 100);

  return (
    <div className={`carousel ${className}`}>
      <div className="carousel-header">
        <span><TrendingUp /> Live Institutional Disbursements</span>
        <span><ShieldCheck /> Real-time Verified</span>
      </div>
      <div className="marquee-row">
        <div className="marquee-content">
          {row1.concat(row1).map((item, idx) => (
            <div key={`r1-${item.id}-${idx}`} className="marquee-item">
              <div className="avatar">{item.name.charAt(0)}</div>
              <span>{item.name}</span>
              <span>{item.maskedAccount}</span>
              <span>{item.formattedAmount}</span>
            </div>
          ))}
        </div>
      </div>
      {!compact && (
        <div className="marquee-row reverse">
          <div className="marquee-content">
            {row2.concat(row2).map((item, idx) => (
              <div key={`r2-${item.id}-${idx}`} className="marquee-item">
                <div className="avatar">{item.name.charAt(0)}</div>
                <span>{item.name}</span>
                <span>{item.maskedAccount}</span>
                <span>{item.formattedAmount}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};