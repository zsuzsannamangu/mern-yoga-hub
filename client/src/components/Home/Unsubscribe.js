import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const email = searchParams.get('email');

  useEffect(() => {
    const unsubscribe = async () => {
      if (!email) {
        setStatus('invalid');
        return;
      }

      try {
        const res = await fetch(`${process.env.REACT_APP_API}/api/subscribers/unsubscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });

        if (res.ok) {
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch {
        setStatus('error');
      }
    };

    unsubscribe();
  }, [email]);

  if (status === 'loading') return <p>Processing your request...</p>;
  if (status === 'invalid') return <p>Invalid request. No email provided.</p>;
  if (status === 'success') return <p>You’ve been unsubscribed successfully. We’re sorry to see you go!</p>;
  if (status === 'error') return <p>Something went wrong. Please try again later.</p>;
};

export default Unsubscribe;
