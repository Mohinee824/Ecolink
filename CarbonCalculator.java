import java.util.Scanner;

public class CarbonCalculator {

    public static double calculateCarbon(double electricity, double fuel, double waste) {
        double carbon = (electricity * 0.92) + (fuel * 2.31) + (waste * 0.5);
        return carbon;
    }

    public static void displayImpact(double carbon) {
        if (carbon < 50) {
            System.out.println("Low Environmental Impact 🌱");
        } else if (carbon < 150) {
            System.out.println("Moderate Environmental Impact ⚠️");
        } else {
            System.out.println("High Environmental Impact 🚨");
        }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.println("=== EcoLink Carbon Footprint Calculator ===");

        System.out.print("Enter electricity usage (kWh): ");
        double electricity = sc.nextDouble();

        System.out.print("Enter fuel consumption (litres): ");
        double fuel = sc.nextDouble();

        System.out.print("Enter waste generated (kg): ");
        double waste = sc.nextDouble();

        double carbon = calculateCarbon(electricity, fuel, waste);

        System.out.println("\nEstimated Carbon Footprint: " + carbon + " kg CO2");
        displayImpact(carbon);

        sc.close();
    }
}
