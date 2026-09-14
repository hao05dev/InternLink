package com.internlink.core.service;

import com.internlink.core.dto.auth.AuthResponse;
import com.internlink.core.dto.auth.LoginRequest;
import com.internlink.core.dto.auth.RegisterRequest;
import com.internlink.core.entity.Role;
import com.internlink.core.entity.User;
import com.internlink.core.repository.UserRepository;
import com.internlink.core.security.CustomUserDetails;
import com.internlink.core.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .email("student@internlink.edu.vn")
                .password("encoded_password")
                .fullName("Nguyen Van A")
                .role(Role.STUDENT)
                .isActive(true)
                .build();
    }

    @Test
    @DisplayName("Should register successfully when email is unique")
    void register_Success() {
        RegisterRequest request = new RegisterRequest(
                "Nguyen Van A",
                "student@internlink.edu.vn",
                "123456",
                "0901234567",
                "TP.HCM",
                Role.STUDENT);

        when(userRepository.existsByEmail(request.email())).thenReturn(false);
        when(passwordEncoder.encode(request.password())).thenReturn("encoded_password");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(jwtService.generateToken(any(CustomUserDetails.class))).thenReturn("mocked-jwt-token");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("mocked-jwt-token", response.accessToken());
        assertEquals("student@internlink.edu.vn", response.email());
        assertEquals(Role.STUDENT, response.role());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when registering with existing email")
    void register_DuplicateEmail_ThrowsException() {
        RegisterRequest request = new RegisterRequest(
                "Nguyen Van A",
                "student@internlink.edu.vn",
                "123456",
                "0901234567",
                "TP.HCM",
                Role.STUDENT);

        when(userRepository.existsByEmail(request.email())).thenReturn(true);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> authService.register(request));

        assertTrue(exception.getMessage().contains("already registered"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should login successfully with valid credentials")
    void login_Success() {
        LoginRequest request = new LoginRequest("student@internlink.edu.vn", "123456");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(null);
        when(userRepository.findByEmail(request.email())).thenReturn(Optional.of(sampleUser));
        when(jwtService.generateToken(any(CustomUserDetails.class))).thenReturn("mocked-jwt-token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mocked-jwt-token", response.accessToken());
        assertEquals(sampleUser.getEmail(), response.email());
    }

    @Test
    @DisplayName("Should throw BadCredentialsException when password is wrong")
    void login_WrongPassword_ThrowsException() {
        LoginRequest request = new LoginRequest("student@internlink.edu.vn", "wrong_password");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(BadCredentialsException.class, () -> authService.login(request));
        verify(userRepository, never()).findByEmail(anyString());
    }
}