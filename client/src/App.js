import './App.css';

import { Routes , Route } from "react-router-dom"

import { UserContext } from './UserContext';
import { useState , useEffect } from 'react';


import LandingPage from './GeneralComponents/LandingPage';
import Login from './GeneralComponents/Login';
import UserForm from './Users/UserForm';
import Dashboard from './Users/Dashboard'
import NavBar from './GeneralComponents/NavBar';
import ResolutionsPage from './Resolutions/ResolutionsPage';
import BrowseUsers from './Users/BrowseUsers';
import UserPage from './Users/UserPage';

function App() {
  
  // console.log('app rendered')
  const [user, setUser] = useState()
  const [users, setUsers] = useState()
  const [resolutions, setResolutions] = useState([])

  useEffect(() => {
    fetch("/resolutions").then(r => r.json()).then(setResolutions)
    fetch("/users").then(r=> r.json()).then(setUsers)
  }, [])

  useEffect(() => {
    fetch("/me").then(r => {
      if(r.ok){
        r.json().then(setUser)
      }
    })
  }, [])

  function handleResolutions (newResolution){
    setResolutions([newResolution, ...resolutions ])
  }

  function handleUserChange (userObj){
    const filteredUsers = users.filter((u) => u.id !== userObj.id)
    if (userObj.name){
      return setUsers([userObj, ...filteredUsers])
    }
    return setUsers([...filteredUsers])
  }
   
  function handlePacts(newPact , method){

    const userPacts = user.pacts.filter((pact) => pact.id != newPact.id)

    const resolutionsFromPacts = userPacts.map((p)=> p.resolution)

    const uneditedUsers = users.filter((u) => u.id !== newPact.user_id)  

    if (method !== "DELETE"){
      userPacts.unshift(newPact)
      resolutionsFromPacts.unshift(newPact.resolution)
    }
    
    const userResolutions = Array.from(new Set(resolutionsFromPacts.map(r => r.id))).map(id => {
      return resolutionsFromPacts.find( r=> r.id === id) 
    })
   
    setUser({...user, 'pacts':userPacts, 'resolutions':userResolutions})
    
    setUsers([{...user, 'pacts':userPacts, 'resolutions':userResolutions}, ...uneditedUsers ])

    const editedResolution = resolutions.filter(res => res.id == newPact.resolution.id).pop()

    const uneditedResolutions = resolutions.filter(res=> res.id !== newPact.resolution.id)

    const userList = editedResolution.unique_users.filter( u => u.id !== user.id)

    const userResolutionsIDs = userResolutions.map((r) => r.id)

    if(method !== "DELETE" || userResolutionsIDs.includes(editedResolution.id)){
      userList.push({id: user.id, name: user.name})
    }

    const newResolutionsObj = [{...editedResolution, 'unique_users':userList} , ...uneditedResolutions]
    
    setResolutions(newResolutionsObj)
   
  }

  return (
    <>
    
   <UserContext.Provider value = {user}>
   
       <NavBar setUser = {setUser}></NavBar>
       <Routes>
         <Route path = "/" element = {<LandingPage setUser={setUser}/>}> </Route>
         <Route path = "/login" element={<Login setUser = {setUser} />}></Route>
         <Route path = "/dashboard" element = {<Dashboard handlePacts={handlePacts}/>}></Route>
         <Route path = "/users" element = {<BrowseUsers users={users}/>} />
         <Route path = "/users/:id" element = {<UserPage users={users} setUsers={setUsers} handlePacts={handlePacts} setUser={setUser}/>}/>
         <Route path = "/users/:id/edit" element = {<UserForm user={user} setUser={setUser} handleUserChange={handleUserChange}/>}/>
         <Route path = "/signup" element = {<UserForm handleUserChange={handleUserChange}/>}></Route>
         <Route path = "/resolutions" element = {<ResolutionsPage resolutions={resolutions} handleResolutions = {handleResolutions} handlePacts={handlePacts}/>}></Route>
       </Routes>
  
   </UserContext.Provider>
  
    </>
   
    
  );
}

export default App;

// const OverlayDiv = styled.div`

// display: ${props => props.active? 'none' : ''};
// `

// const PortalSite = styled.div`
//   display: ${props => props.active? '': 'none'};
//   background: red;
// `