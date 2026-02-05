namespace backend.DTOs
{
    public class CourseDTO
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public int DurationInHours { get; set; }
        public decimal Price { get; set; }
    }
}
