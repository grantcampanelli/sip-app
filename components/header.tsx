import React from 'react';
import { useSession, getSession, signIn, signOut} from "next-auth/react"




const Header = () => {

    const { data: session } = useSession()
    if (session) {
        return (
            <header className="bg-white"> 
                <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
                    <div className="flex items-center text-gray-900 hover:text-gray-900" >
                        <a href="/">
                            Sip
                       
                        </a>
                    </div>
                    <div className="flex items-center">

                        <a href="/wineries" className="ml-8 text-gray-900 hover:text-gray-900">
                            Wineries
                        </a>
                        <a className="ml-8 text-gray-900 hover:text-gray-900">
                        <button onClick={() => signOut()}>Sign Out</button>
                        </a>
                    </div>
            
                    
                </nav>
            </header>
        );
    }
    else {
        return (
            <header className="bg-white"> 
                <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
                    <div className="flex items-center text-gray-900 hover:text-gray-900" >
                        <a href="/">
                            Sip
                       
                        </a>
                    </div>
                    <div className="flex items-center">
                    <a className="ml-8 text-gray-900 hover:text-gray-900">
                    <button onClick={() => signIn()}>Sign in</button>
                    </a>
                    </div>
                    
                </nav>
            </header>
        );
    }
    
    
};

export default Header;