using Advisor.Core.Interfaces.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;

namespace Advisor.Core.Services
{
    public class EmailService : IEmailService
    {
        public Task SendEmailAsync(string email, string subject, string message)
        {
            var mail= "";
            var pw = "";
            var client = new SmtpClient("smtp.office365.com", 587)
            {
                UseDefaultCredentials = false,
                EnableSsl = true,
                Credentials = new NetworkCredential(mail, pw,"gmail.com")
            };

            return client.SendMailAsync(
                new MailMessage(
                    from :mail,
                    to:email,
                    subject,
                    message
                    ));
;
        }
    }
}
