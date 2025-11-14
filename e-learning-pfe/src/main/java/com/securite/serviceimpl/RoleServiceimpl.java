package com.securite.serviceimpl;

import com.securite.models.Role;
import com.securite.repository.RoleRepository;
import com.securite.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleServiceimpl implements RoleService {
private final RoleRepository repositoryrole;
	@Override
	public Role addrole(Role role) {
		// TODO Auto-generated method stub
		return repositoryrole.save(role);
	}

	@Override
	public List<Role> allrols() {
		// TODO Auto-generated method stub
		return repositoryrole.findAll();
	}

	@Override
	public void delete(Integer id) {
		repositoryrole.deleteById(id);
		
	}

	@Override
	public Role findbyid(Integer id) {
		
		return repositoryrole.findById(id).get();
	}

}
