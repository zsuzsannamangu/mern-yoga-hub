import React from 'react';
import { useUserAuth } from './UserAuthContext';

const withUserAuth = (WrappedComponent) => {
    return (props) => {
        const { user } = useUserAuth();
        return <WrappedComponent {...props} user={user} />;
    };
};

export default withUserAuth;
