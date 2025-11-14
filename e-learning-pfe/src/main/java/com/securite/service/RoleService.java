package com.securite.service;



import com.securite.models.Role;

import java.util.List;



public interface RoleService {
	Role addrole(Role role);
	List<Role> allrols();
	void delete(Integer id);
	Role findbyid(Integer id);
	

}
