import React from 'react';
import jeanImg from '../assets/jean.jpg';
import klarisseImg from '../assets/klarisse.jpg';
import matthewImg from '../assets/matthew.jpg';

export default function AboutView() {
  const teamMembers = [
    { 
      name: 'Jean Lanierod V. Carlos', 
      role: 'Project Lead', 
      img: jeanImg, 
      desc: 'The Project Lead is responsible for overseeing the planning, coordination, and execution of the project, ensuring that team members stay aligned with objectives.' 
    },
    { 
      name: 'Klarisse Borlado', 
      role: 'Database Administrator', 
      img: klarisseImg, 
      desc: 'The Database Manager is responsible for designing, organizing, and maintaining the database, ensuring data is stored securely, efficiently, and is easily accessible.' 
    },
    { 
      name: 'Matthew Francia', 
      role: 'UI/UX Designer', 
      img: matthewImg, 
      desc: 'The UI/UX Designer is responsible for designing user-friendly and visually appealing interfaces, ensuring a smooth and intuitive user experience..' 
    }
  ];

  return (
    <div className="wms-about-container">
      {teamMembers.map(m => (
        <div className="wms-card wms-member-card" key={m.name}>
          <div className="wms-card-top accent center-content">
            <img src={m.img} className="wms-member-img" alt={m.name} />
          </div>
          <div className="wms-card-bottom center-content">
            <h4 style={{margin:0}}>{m.name}</h4>
            <p style={{fontSize:'0.7rem', color: '#6b7280', marginTop:'5px'}}>{m.role}</p>
          </div>
          <div className="wms-member-desc">{m.desc}</div>
        </div>
      ))}
    </div>
  );
}
