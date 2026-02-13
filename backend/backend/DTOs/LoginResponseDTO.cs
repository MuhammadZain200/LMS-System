namespace backend.DTOs
{
    public class LoginResponseDTO
    {
        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string Email { get; set; }
        public string Password { get; set; }
        public string Token { get; set; } = null!;
        public string Role { get; set; } = null!;
        public string? ProfileImageUrl { get; set; }
    }
}
