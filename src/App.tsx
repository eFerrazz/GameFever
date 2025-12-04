import { Routes, Route } from 'react-router-dom';

import './globals.css';
import SigninForm from './_auth/forms/SigninForm';
import Home from './_root/pages/Home';
import SignupForm from './_auth/forms/SignupForm';
import AuthLayout from './_auth/AuthLayout';
import RootLayout from './_root/RootLayout';

import { Toaster } from "@/components/ui/toaster"
import Explore from './_root/pages/Explore';
import Saved from './_root/pages/Saved';
import CreatePost from './_root/pages/CreatePost';
import EditPost from './_root/pages/EditPost';
import PostDetails from './_root/pages/PostDetails';
import Profile from './_root/pages/Profile';
import UpdateProfile from './_root/pages/UpdateProfile';
import Chat from './_root/pages/Chat';
import ForgotPassword from './_auth/forms/ForgotPassword';
import ResetPassword from './_auth/forms/ResetPassword';



const App = () => {
  return (
    <main className='flex h-screen custom-scrollbar'>
        <Routes>
            {/* Rotas publicas */}
            <Route element={<AuthLayout />}>
             <Route path='/sign-in' element={<SigninForm />}/>
             <Route path='/sign-up' element={<SignupForm />}/>
             <Route path='/forgot-password' element={<ForgotPassword />} />
             <Route path='/reset-password' element={<ResetPassword />} />
            </Route>

            {/* Rotas privadas */}
            <Route element={<RootLayout />}>
             <Route index element={<Home />}/>
             <Route path="/explore" element={<Explore />}/>
             <Route path="/saved" element={<Saved />}/>
             <Route path="/chat" element={<Chat />}/>
             <Route path="/create-post" element={<CreatePost />}/>
             <Route path="/update-post/:id" element={<EditPost />}/>
             <Route path="/posts/:id" element={<PostDetails />}/>
             <Route path="/profile/:id/*" element={<Profile />}/>
             <Route path="/update-profile/:id" element={<UpdateProfile />}/>
            </Route>
        </Routes>

        {/* Accessibility Widget sempre visível */}
      

        <Toaster />
    </main>
  )
}


export default App
