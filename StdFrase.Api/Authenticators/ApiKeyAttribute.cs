using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace StdFrase.Api.Authenticators
{
    [AttributeUsage(AttributeTargets.Class)]
    public class ApiKeyAttribute : Attribute, IAsyncActionFilter
    {
        private const string APIKEYNAME = "ApiKey";

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            if (!context.HttpContext.Request.Headers.ContainsKey(APIKEYNAME))
            {
                context.Result = new ContentResult()
                {
                    StatusCode = 401,
                    Content = "Api Key was not provided"
                };
                return;
            }

            string extractedApiKey = context.HttpContext.Request.Headers[APIKEYNAME];

            IConfiguration appSettings = context.HttpContext.RequestServices.GetRequiredService<IConfiguration>();
            string apiKey = appSettings.GetValue<string>(APIKEYNAME);

            if (!apiKey.Equals(extractedApiKey))
            {
                context.Result = new ContentResult()
                {
                    StatusCode = 401,
                    Content = "Api Key is not valid"
                };
                return;
            }

            await next();
        }
    }

    /// <summary>
    /// Class to enable insertion of Apikey on Swagger UI as a header.
    /// </summary>
    public class AddRequiredHeaderParameter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            if (operation.Parameters == null)
                operation.Parameters = new List<OpenApiParameter>();

            operation.Parameters.Add(new OpenApiParameter // NonBodyParameter
            {
                Name = "ApiKey",
                In = ParameterLocation.Header, // "header",
                //Type = "string",
                Required = false
            });
        }
    }
}