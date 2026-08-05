import React from 'react'

export default function KertasKerja({ project }) {
  if (!project) return null;

  return (
    <div className="kertas-kerja">
      <h2 style={{ textAlign: 'center', marginBottom: 24, fontSize: 18, fontWeight: 'bold' }}>KERTAS KERJA</h2>
      
      <div className="kk-header">
        <div className="kk-header-row">
          <div className="kk-label">Nama</div>
          <div className="kk-value">: {project.name}</div>
        </div>
        <div className="kk-header-row">
          <div className="kk-label">Tanggal</div>
          <div className="kk-value">: {project.styleGuide?.shootDate || '-'}</div>
        </div>
        <div className="kk-header-row">
          <div className="kk-label">Deadline</div>
          <div className="kk-value">: {project.deadline || '-'}</div>
        </div>
        <div className="kk-header-row">
          <div className="kk-label">Klien</div>
          <div className="kk-value">: {project.client || '-'}</div>
        </div>
        <div className="kk-header-row">
          <div className="kk-label">Lokasi/Jam</div>
          <div className="kk-value">: {project.styleGuide?.shootLocation || '-'} {project.styleGuide?.shootTime ? `(${project.styleGuide?.shootTime})` : ''}</div>
        </div>
      </div>

      <table className="kk-table">
        <tbody>
          <tr>
            <td className="kk-col-main">
              <strong>Tujuan/Target Audience:</strong>
              <div style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>{project.targetAudience || '-'}</div>
            </td>
            <td className="kk-col-side"></td>
          </tr>
          <tr>
            <td className="kk-col-main">
              <strong>Konsep/Ide/Detail Konten:</strong>
              <div style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>{project.concept || '-'}</div>
            </td>
            <td className="kk-col-side"></td>
          </tr>
          <tr>
            <td className="kk-col-main">
              <strong>Panduan Gaya:</strong>
              <div style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>{project.styleGuide?.notes || '-'}</div>
            </td>
            <td className="kk-col-side"></td>
          </tr>
          <tr>
            <td className="kk-col-main">
              <strong>Referensi:</strong>
              <div className="kk-refs" style={{ marginTop: 8 }}>
                {project.styleGuide?.links?.map((link, i) => (
                  <div key={i}><a href={link} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>{link}</a></div>
                ))}
                <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
                  {project.styleGuide?.images?.map((img, i) => (
                    <img key={i} src={img} alt={`ref-${i}`} style={{ height: 100, objectFit: 'cover', borderRadius: 4 }} />
                  ))}
                </div>
              </div>
            </td>
            <td className="kk-col-side" style={{ verticalAlign: 'top' }}>
              <strong>Spesifikasi Ukuran/Format:</strong>
              <div style={{ marginTop: 8 }}>{project.styleGuide?.formatSpec || '-'}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
