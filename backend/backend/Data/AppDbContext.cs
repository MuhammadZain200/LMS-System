using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Course> Courses { get; set; }
        public DbSet<Enrollment> Enrollments { get; set; }
        public DbSet<Announcement> Announcements { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Table naming conventions (optional but clean)
            modelBuilder.Entity<User>().ToTable("Users");
            modelBuilder.Entity<Course>().ToTable("Courses");
            modelBuilder.Entity<Enrollment>().ToTable("Enrollments");
            modelBuilder.Entity<Announcement>().ToTable("Announcements");

            // User configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.Id);
                entity.Property(u => u.Name)
                      .IsRequired()
                      .HasMaxLength(100);
                entity.Property(u => u.Email)
                      .IsRequired()
                      .HasMaxLength(150);
                entity.Property(u => u.Password)   
                        .IsRequired()
                        .HasMaxLength(255);
                entity.Property(u => u.Role)
                      .IsRequired()
                      .HasMaxLength(50);
            });

            // Course configuration
            modelBuilder.Entity<Course>(entity =>
            {
                entity.HasKey(c => c.Id);
                entity.Property(c => c.Title)
                      .IsRequired()
                      .HasMaxLength(100);
                entity.Property(c => c.Description)
                      .HasMaxLength(500);
                entity.Property(c => c.Instructor)
                      .HasMaxLength(100);
                entity.Property(c => c.Duration)
                      .IsRequired();
                entity.Property(c => c.Price)
                      .IsRequired()
                      .HasPrecision(18, 2);

                // Long-form course content, optional
                entity.Property(c => c.Content)
                      .HasColumnType("nvarchar(max)");

                // Optional link to instructor user for role-based queries
                entity.HasOne(c => c.InstructorUser)
                      .WithMany()
                      .HasForeignKey(c => c.InstructorId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            // Enrollment configuration (many-to-many via Enrollment)
            modelBuilder.Entity<Enrollment>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.HasOne(e => e.User)
                      .WithMany(u => u.Enrollments)
                      .HasForeignKey(e => e.UserID)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Course)
                      .WithMany(c => c.Enrollments)
                      .HasForeignKey(e => e.CourseID)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Announcement configuration
            modelBuilder.Entity<Announcement>(entity =>
            {
                entity.HasKey(a => a.Id);

                entity.Property(a => a.Title)
                      .IsRequired()
                      .HasMaxLength(150);

                entity.Property(a => a.Message)
                      .IsRequired()
                      .HasMaxLength(2000);

                entity.HasOne(a => a.Course)
                      .WithMany(c => c.Announcements)
                      .HasForeignKey(a => a.CourseId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(a => a.CreatedBy)
                      .WithMany()
                      .HasForeignKey(a => a.CreatedById)
                      .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
