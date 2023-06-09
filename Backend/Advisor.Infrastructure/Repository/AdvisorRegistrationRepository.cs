﻿using Advisor.Core.Domain.Models;
using Advisor.Core.Interfaces.Repositories;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using Advisor.Infrastructure.Data;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Http;
using Advisor.Core.Domain.DTOs;
using Advisor.Core.Interfaces.Services;
using Advisor.Core.Domain;

namespace Advisor.Infrastructure.Repository
{
    public class AdvisorRegistrationRepository : IAdvisorRegistrationRepository
    {
        private readonly AdvisorDbContext _context;
        private readonly IEmailService _email;
        private readonly IConfiguration _configuration;
        private static Random random = new Random();

        public AdvisorRegistrationRepository(IEmailService email,IConfiguration configuration, AdvisorDbContext context, IHttpContextAccessor httpContext)
        {
            _configuration = configuration;
            _context = context;
            _email = email;
        }

        public string? CreateAdvisor(AdvisorRegisterDTO request)
        {
            if (_context.Users.Any(X => X.Email == request.Email))
                return "Emali ALready Exists";

            CreatePasswordHash(request.Password, out byte[] passwordHash, out byte[] passwordSalt);

            var advId = CreateAdvisorId();
            Users advisor = new Users();
            advisor.Address = request.Address;
            advisor.Email = request.Email;
            advisor.Phone = request.Phone;
            advisor.Company = request.Company;
            advisor.City = request.City;
            advisor.State = request.State;
            advisor.PasswordHash = passwordHash;
            advisor.PasswordSalt = passwordSalt;
            advisor.FirstName = request.FirstName;
            advisor.LastName = request.LastName;
            advisor.SortName = request.LastName + ", " + request.FirstName;
            advisor.RoleID = 1;
            advisor.AdvisorID = advId;
            advisor.ClientID = null;
            advisor.AgentID = null;
            advisor.Active = 1;
            advisor.CreatedDate = DateTime.Now;
            advisor.ModifiedBy = advId;
            advisor.ModifiedDate = DateTime.Now;
            advisor.DeletedFlag = 0;
            advisor.VerificationToken = CreateRandomToken();

            _context.Users.Add(advisor);
            _context.SaveChanges();
            return "User Registered";
        }


        private string CreateAdvisorId()
        {
            const string chars = "A1BC2DE3FG5H6I7J4K8L9MN0OPQRSTUVWXYZ";
            var newId = "A"+new string(Enumerable.Repeat(chars, 5)
                .Select(s => s[random.Next(s.Length)]).ToArray());
            var res = _context.Users.Any(u => u.AdvisorID == newId);
            if (res == true)
            {
                return CreateAdvisorId();
            }
            return newId;
        }

        public string CreateRandomToken()
        {
            var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(64));
            if (_context.Users.Any(x => x.AdvisorID == token))
                token = CreateRandomToken();
            return token;
        }
        private void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            using (var hmac = new HMACSHA512())
            {
                passwordSalt = hmac.Key;
                passwordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
            }
        }


        public string LoginAdvisor(AdvisorLoginDTO request)
        {
            var res = _context.Users.FirstOrDefault(X => X.Email == request.Email);
            if (res is null || res.DeletedFlag == 1)
                return "Email doesn't exist.";

            if (!VerifyPasswordHash(request.Password, res.PasswordHash, res.PasswordSalt))
                return "Wrong password.";

            string token = CreateToken(res);
            return token;

        }


        private bool VerifyPasswordHash(string password, byte[] passwordHash, byte[] passwordSalt)
        {
            using (var hmac = new HMACSHA512(passwordSalt))
            {
                var computedHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
                return computedHash.SequenceEqual(passwordHash);
            }
        }
        private string CreateToken(Users user)
        {
            List<Claim> claims = new List<Claim>
            {
                 new Claim(ClaimTypes.Email,user.Email),
                 new Claim(ClaimTypes.Role, "advisor")//user.role
            };
            var key = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(_configuration.GetSection("AppSettings:Token").Value));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);
            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds);

            var jwt = new JwtSecurityTokenHandler().WriteToken(token);

            return jwt;
        }


        public string ChangePasswordAdv(string email)
        {
            var user = _context.Users.FirstOrDefault(x => x.Email == email);
            if (user is null || user.DeletedFlag==1)
            {
                return "Bad Request.";
            }
            user.PasswordResetToken = CreateRandomToken();
            user.ResetTokenExpires = DateTime.Now.AddDays(1);
            _context.SaveChanges();
            
            return user.PasswordResetToken;
        }

        public string ResetPasswordAdvAfterLogin(PasswordResetDTO reset)
        {
            var user = _context.Users.FirstOrDefault(x => x.Email == reset.email);
            if (user == null || user.DeletedFlag == 1)
                return "user doesnt exist";

            if (DateTime.Now > user.ResetTokenExpires)
                return "Session expired.";

            if (!reset.token.Equals(user.PasswordResetToken))
                return "Not authorized.";

            CreatePasswordHash(reset.Password, out byte[] passwordHash, out byte[] passwordSalt);
            user.PasswordSalt = passwordSalt;
            user.PasswordHash = passwordHash;
            _context.SaveChanges();

            return "Password updated.";
        }

        public async Task<string>  ForgotPassword(PasswordResetWithoutLoginDTO request)
        {
            DateTime now=DateTime.Now;
            var user = _context.Users.FirstOrDefault(x => x.Email == request.Email);
            if (user is null || user.DeletedFlag==1)
                return "No User with this email exists.";
            user.PasswordResetToken = CreateRandomToken();
            user.ResetTokenExpires = DateTime.Now.AddDays(1);
            _context.SaveChanges();
            var receiver = request.Email;
            var subject = "token to reset password";
            var message = "use this token within one day " + user.PasswordResetToken;
            //await _email.SendEmailAsync(receiver, subject, message);
            return user.PasswordResetToken;
            //iske baad call after login wala
        }

        public AdvisorInfoDTO? GetAdvisorInfo(string email)
        {
            var user = _context.Users.FirstOrDefault(x => x.Email == email);
            if (user is null || user.DeletedFlag == 1)
                return null;
            AdvisorInfoDTO advisorInfo = new AdvisorInfoDTO();
            advisorInfo.Email = email;
            advisorInfo.LastName = user.LastName;
            advisorInfo.FirstName = user.FirstName;
            advisorInfo.AdvisorID = user.AdvisorID;
            advisorInfo.Address = user.Address;
            advisorInfo.City = user.City;
            advisorInfo.Company = user.Company;
            advisorInfo.Phone = user.Phone;
            advisorInfo.State = user.State;
            return advisorInfo;
        }

        public AdvisorInfoDTO GetClientInfo(string id)
        {
            var user = _context.Users.FirstOrDefault(x => x.ClientID == id);
            if (user is null || user.DeletedFlag == 1)
                return null;
            AdvisorInfoDTO advisorInfo = new AdvisorInfoDTO();
            advisorInfo.Email = user.Email;
            advisorInfo.LastName = user.LastName;
            advisorInfo.FirstName = user.FirstName;
            advisorInfo.AdvisorID = id;
            advisorInfo.Address = user.Address;
            advisorInfo.City = user.City;
            advisorInfo.Company = user.Company;
            advisorInfo.Phone = user.Phone;
            advisorInfo.State = user.State;
            return advisorInfo;
        }

        public List<AdvisorInfoDTO> GetAllAdvisors()
        {
            List<AdvisorInfoDTO> users = new List<AdvisorInfoDTO>();

            foreach (var user in _context.Users)
            {
                if (user.AdvisorID != null) {
                    AdvisorInfoDTO advisorInfo = new AdvisorInfoDTO();
                    advisorInfo.Email = user.Email;
                    advisorInfo.LastName = user.LastName;
                    advisorInfo.FirstName = user.FirstName;
                    advisorInfo.AdvisorID = user.AdvisorID;
                    advisorInfo.Address = user.Address;
                    advisorInfo.City = user.City;
                    advisorInfo.Company = user.Company;
                    advisorInfo.Phone = user.Phone;
                    advisorInfo.State = user.State;
                    users.Add(advisorInfo);
                }
            }

            return users;
        }

        public string UpdateAdvisor(string email, AdvisorInfoDTO advisorInfo)
        {
            var user = _context.Users.FirstOrDefault(x => x.Email == email);
            if (user == null)
            {
                return "No such user exists advisor";
            }
            
            user.LastName = advisorInfo.LastName;
            user.FirstName = advisorInfo.FirstName;
            user.AdvisorID = advisorInfo.AdvisorID;
            user.Address = advisorInfo.Address;
            user.City = advisorInfo.City;
            user.SortName= advisorInfo.LastName + ", " + advisorInfo.FirstName;
            user.Company = advisorInfo.Company;
            user.Phone = advisorInfo.Phone;
            user.State = advisorInfo.State;
            _context.Update(user);
            _context.SaveChanges();
            return "User Updated";
        }

        public string DeleteUser(string id)
        {
            var user = _context.Users.FirstOrDefault(x => x.ClientID == id);
            user.DeletedFlag = 1;
            user.Active = 0;
            _context.Update(user);
            _context.SaveChanges();
            return "User-Deleted";
        }

        public List<ClientInfoDto> GetAllClientsForAnAdvisor(string email)
        {
            var adv=_context.Users.First(x => x.Email == email);
            var advid = adv.UserID;
            List<AdvisorClient> clients = _context.AdvisorClients.Where(x => x.AdvisorId==advid).ToList();
            List<int> clientids = new List<int>();
            foreach (var x in clients) {
                
                clientids.Add(x.ClientId);
            }
            List<ClientInfoDto> list = new List<ClientInfoDto>();
            foreach (int id in clientids) {

                ClientInfoDto clientInfo = new ClientInfoDto();
                Users Client = _context.Users.First(c => c.UserID == id);
                if (Client.DeletedFlag == 0) {
                    clientInfo.UserId = id;
                    clientInfo.Address = Client.Address;
                    clientInfo.City = Client.City;
                    clientInfo.ClientID = Client.ClientID;
                    clientInfo.Email = Client.Email;
                    clientInfo.FirstName = Client.FirstName;
                    clientInfo.LastName = Client.LastName;
                    clientInfo.Company = Client.Company;
                    clientInfo.State = Client.State;
                    clientInfo.Phone = Client.Phone;
                    list.Add(clientInfo);
                }
            }
            return list;
        }

        string IAdvisorRegistrationRepository.ChangePasswordAdv(string email)
        {
            throw new NotImplementedException();
        }

    }
}