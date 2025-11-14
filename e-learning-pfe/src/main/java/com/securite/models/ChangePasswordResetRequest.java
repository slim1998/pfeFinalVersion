package com.securite.models;

import lombok.Builder;
import lombok.Data;


@Data
@Builder
public class ChangePasswordResetRequest {
	private String email;
   private String newPassword;
   private String confirmationPassword;
}

