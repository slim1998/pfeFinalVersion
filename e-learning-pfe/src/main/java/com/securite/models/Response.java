package com.securite.models;


import lombok.Builder;
import lombok.Data;

import java.util.Set;


@Data
@Builder
public class Response {
   private String responseMessage;
   private String email;
   private Long id;
   private String firstName;
   private String lastName;
   private String password;
   private String adress;
   private String phone;
   private Set<String> roles;



}

