﻿using Advisor.Core.Domain;
using Advisor.Core.Domain.DTOs;
using Advisor.Core.Domain.Models;

namespace Advisor.Core.Interfaces.Repositories
{
    public interface IAdvisorRegistrationRepository
    {
        string? CreateAdvisor(AdvisorRegisterDTO request);
        string LoginAdvisor(AdvisorLoginDTO request);
        string ChangePasswordAdv(string email);
        string ResetPasswordAdvAfterLogin(PasswordResetDTO request);
        Task<string> ForgotPassword(PasswordResetWithoutLoginDTO request);
        AdvisorInfoDTO? GetAdvisorInfo(string email);
        AdvisorInfoDTO GetClientInfo(string id);

        List<AdvisorInfoDTO> GetAllAdvisors();
        string UpdateAdvisor(string email, AdvisorInfoDTO info);
        string DeleteUser(string id);
        List<ClientInfoDto> GetAllClientsForAnAdvisor(string email);

    }
}
