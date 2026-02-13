using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    public class ProfileController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
