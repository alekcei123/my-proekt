
import React, { useState, useEffect } from 'react';
import UserCard from '../components/UserCard'; // Импорт компонента выше

const Feed = () => {
  const [users, setUsers] = useState([]);
  const [commonInterests, setCommonInterests] = useState({});


  useEffect(() => {
    const fetchUsers = async () => {
      
     const res = await fetch('/api/get-users.php');; 
      const data = await res.json();
      setUsers(data.data);
    };
    fetchUsers();
  }, []);

  
  useEffect(() => {
    if (users.length === 0) return;

    
    users.forEach(user => {
      loadCommonInterests(user.id);
    });
  }, [users]);

  const loadCommonInterests = async (userId) => {
    try {
      const res = await fetch('/api/get-recommendations.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      
      const data = await res.json();
      
      if (data.status === 'success') {
        setCommonInterests(prev => ({
          ...prev,
          [userId]: data.data 
        }));
      }
    } catch (err) {
      console.error('Ошибка загрузки интересов:', err);
    }
  };

  return (
    <div className="feed-container">
      <h2>Лента рекомендаций</h2>
      {users.length === 0 ? (
        <p>Загрузка...</p>
      ) : (
        users.map(user => (
          
          <UserCard 
            key={user.id} 
            user={user} 
            commonInterests={commonInterests} 
          />
        ))
      )}
    </div>
  );
};

export default Feed;
